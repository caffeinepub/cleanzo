import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type CarType = {
    #hatchback;
    #sedan;
    #midSUV;
    #SUV;
  };

  public type AssignmentStatus = {
    #pending;
    #done;
    #skipped;
  };

  public type Assignment = {
    carOwnerId : Principal;
    crewMemberId : Principal;
    date : Text;
    status : AssignmentStatus;
  };

  public type CarOwnerProfile = {
    name : Text;
    email : Text;
    phone : Text;
    carNumber : Text;
    carModel : Text;
    carType : CarType;
    priceSegment : Nat;
    subscriptionActive : Bool;
    registrationDate : Int;
  };

  public type ApprovalStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type CrewMemberProfile = {
    name : Text;
    email : Text;
    phone : Text;
    isActive : Bool;
    approvalStatus : ApprovalStatus;
  };

  public type PaymentRecord = {
    amount : Nat;
    currency : Text;
    timestamp : Int;
    status : Text;
    sessionId : Text;
  };

  public type WaitlistEntry = {
    name : Text;
    email : Text;
    phone : Text;
    carModel : Text;
    sectorSociety : Text;
    carsInFamily : Nat;
    submittedAt : Int;
  };

  let carOwners = Map.empty<Principal, CarOwnerProfile>();
  let crewMembers = Map.empty<Principal, CrewMemberProfile>();
  let assignments = List.empty<Assignment>();
  let skipDays = Map.empty<Principal, List.List<Text>>();
  let payments = Map.empty<Principal, List.List<PaymentRecord>>();
  let checkoutSessions = Map.empty<Text, Principal>();
  let waitlistEntries = List.empty<WaitlistEntry>();

  public type AttendanceRecord = {
    date : Text;
    clockIn : Int;
    clockOut : ?Int;
    hoursWorked : ?Float;
  };

  let attendanceRecords = Map.empty<Principal, List.List<AttendanceRecord>>();

  func getTodaysRecords(crewId : Principal, date : Text) : List.List<AttendanceRecord> {
    switch (attendanceRecords.get(crewId)) {
      case (null) { List.empty<AttendanceRecord>() };
      case (?records) {
        let filtered = List.empty<AttendanceRecord>();
        for (record in records.values()) {
          if (record.date == date) {
            filtered.add(record);
          };
        };
        filtered;
      };
    };
  };

  func hasUnfinishedClockIn(records : List.List<AttendanceRecord>) : Bool {
    for (record in records.values()) {
      if (record.clockOut == null) {
        return true;
      };
    };
    false;
  };

  func findPendingClockIn(records : List.List<AttendanceRecord>) : ?AttendanceRecord {
    for (record in records.values()) {
      if (record.clockOut == null) {
        return ?record;
      };
    };
    null;
  };

  func processClockIn(crewId : Principal, profile : CrewMemberProfile, date : Text) : AttendanceRecord {
    if (profile.approvalStatus != #approved or not profile.isActive) {
      Runtime.trap("Unauthorized: Only approved and active crew members can clock in");
    };

    let todayRecords = getTodaysRecords(crewId, date);
    if (hasUnfinishedClockIn(todayRecords)) {
      Runtime.trap("Existing unfinished clock-in. Please clock out first");
    };

    {
      date;
      clockIn = Time.now();
      clockOut = null;
      hoursWorked = null;
    };
  };

  func processClockOut(crewId : Principal, profile : CrewMemberProfile, date : Text) : AttendanceRecord {
    if (profile.approvalStatus != #approved or not profile.isActive) {
      Runtime.trap("Unauthorized: Only approved and active crew members can clock out");
    };

    let todayRecords = getTodaysRecords(crewId, date);
    let pendingRecord = findPendingClockIn(todayRecords);
    switch (pendingRecord) {
      case (null) {
        Runtime.trap("No clock-in record found for today. Please clock in first");
      };
      case (?record) {
        let clockIn = record.clockIn;
        if (clockIn <= 0) {
          Runtime.trap("Invalid clock-in timestamp for today");
        };
        let now = Time.now();
        let hoursWorked = Int.abs(now - clockIn).toFloat() / 3600000000000.0;
        let minHoursWorked = 0.01;
        let validHours = if (hoursWorked < minHoursWorked) { minHoursWorked } else { hoursWorked };
        return {
          date = record.date;
          clockIn = record.clockIn;
          clockOut = ?now;
          hoursWorked = ?validHours;
        };
      };
    };
  };

  public shared ({ caller }) func clockIn(date : Text) : async () {
    switch (crewMembers.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Only crew members can clock in") };
      case (?profile) {
        let newRecord = processClockIn(caller, profile, date);

        let existingRecords = switch (attendanceRecords.get(caller)) {
          case (null) { List.empty<AttendanceRecord>() };
          case (?records) { records };
        };

        existingRecords.add(newRecord);
        attendanceRecords.add(caller, existingRecords);
      };
    };
  };

  public shared ({ caller }) func clockOut(date : Text) : async () {
    switch (crewMembers.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Only crew members can clock out") };
      case (?profile) {
        let newRecord = processClockOut(caller, profile, date);

        let existingRecords = switch (attendanceRecords.get(caller)) {
          case (null) { List.empty<AttendanceRecord>() };
          case (?records) {
            let filtered = List.empty<AttendanceRecord>();
            for (record in records.values()) {
              if (record.date != date or record.clockOut != null) {
                filtered.add(record);
              };
            };
            filtered;
          };
        };

        existingRecords.add(newRecord);
        attendanceRecords.add(caller, existingRecords);
      };
    };
  };

  public query ({ caller }) func getAttendanceLogs(crewMemberId : Principal) : async [AttendanceRecord] {
    if (caller != crewMemberId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own attendance logs or be an admin");
    };

    switch (attendanceRecords.get(crewMemberId)) {
      case (null) { [] };
      case (?records) { records.toArray() };
    };
  };

  public type WeeklyPaySummary = {
    crewMemberId : Principal;
    weekStart : Text;
    totalHours : Float;
    records : [AttendanceRecord];
  };

  public type PayRelease = {
    crewMemberId : Principal;
    weekStart : Text;
    amount : Nat;
    totalHours : Float;
    releasedAt : Int;
  };

  let payReleases = Map.empty<Principal, List.List<PayRelease>>();

  public query ({ caller }) func getWeeklyHoursSummary(crewMemberId : Principal, weekStart : Text) : async WeeklyPaySummary {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view weekly hours summary");
    };

    switch (attendanceRecords.get(crewMemberId)) {
      case (null) {
        {
          crewMemberId;
          weekStart;
          totalHours = 0.0;
          records = [];
        };
      };
      case (?records) {
        let weekRecords = List.empty<AttendanceRecord>();
        var totalHours : Float = 0.0;

        for (record in records.values()) {
          switch (record.hoursWorked) {
            case (?hours) {
              weekRecords.add(record);
              totalHours := totalHours + hours;
            };
            case (null) {};
          };
        };

        {
          crewMemberId;
          weekStart;
          totalHours;
          records = weekRecords.toArray();
        };
      };
    };
  };

  public shared ({ caller }) func releaseWeeklyPayment(crewMemberId : Principal, weekStart : Text, amount : Nat, totalHours : Float) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can release weekly payments");
    };

    let payRelease : PayRelease = {
      crewMemberId;
      weekStart;
      amount;
      totalHours;
      releasedAt = Time.now();
    };

    let existingReleases = switch (payReleases.get(crewMemberId)) {
      case (null) { List.empty<PayRelease>() };
      case (?releases) { releases };
    };

    existingReleases.add(payRelease);
    payReleases.add(crewMemberId, existingReleases);
  };

  public query ({ caller }) func getPayReleaseHistory(crewMemberId : Principal) : async [PayRelease] {
    if (caller != crewMemberId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own pay release history or be an admin");
    };

    switch (payReleases.get(crewMemberId)) {
      case (null) { [] };
      case (?releases) { releases.toArray() };
    };
  };

  public type ServicePhoto = {
    id : Text;
    carOwnerId : Principal;
    crewMemberId : Principal;
    date : Text;
    beforePhotoId : Text;
    afterPhotoId : Text;
    uploadedAt : Int;
  };

  let servicePhotos = Map.empty<Text, ServicePhoto>();

  public shared ({ caller }) func saveServicePhoto(carOwnerId : Principal, date : Text, beforePhotoId : Text, afterPhotoId : Text) : async () {
    switch (crewMembers.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: Only crew members can upload service photos");
      };
      case (?profile) {
        if (profile.approvalStatus != #approved or not profile.isActive) {
          Runtime.trap("Unauthorized: Only approved and active crew members can upload service photos");
        };
      };
    };

    let assignmentExists = assignments.toArray().any(
      func(assignment) {
        assignment.carOwnerId == carOwnerId and assignment.date == date and assignment.crewMemberId == caller
      }
    );

    if (not assignmentExists) {
      Runtime.trap("Unauthorized: No assignment found for this car owner and date");
    };

    let photoId = caller.toText() # "-" # carOwnerId.toText() # "-" # date;
    let servicePhoto : ServicePhoto = {
      id = photoId;
      carOwnerId;
      crewMemberId = caller;
      date;
      beforePhotoId;
      afterPhotoId;
      uploadedAt = Time.now();
    };

    servicePhotos.add(photoId, servicePhoto);
  };

  public query ({ caller }) func getServicePhoto(carOwnerId : Principal, crewMemberId : Principal, date : Text) : async ?ServicePhoto {
    let isCarOwner = carOwners.containsKey(caller) and caller == carOwnerId;
    let isCrewMember = crewMembers.containsKey(caller) and caller == crewMemberId;
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    if (not (isCarOwner or isCrewMember or isAdmin)) {
      Runtime.trap("Unauthorized: Can only view service photos for your own assignments or be an admin");
    };

    let photoId = crewMemberId.toText() # "-" # carOwnerId.toText() # "-" # date;
    servicePhotos.get(photoId);
  };

  public query ({ caller }) func getServicePhotosForCarOwner(carOwnerId : Principal) : async [ServicePhoto] {
    let isCarOwner = carOwners.containsKey(caller) and caller == carOwnerId;
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    if (not (isCarOwner or isAdmin)) {
      Runtime.trap("Unauthorized: Can only view your own service photos or be an admin");
    };

    let filtered = List.empty<ServicePhoto>();
    for ((_, photo) in servicePhotos.entries()) {
      if (photo.carOwnerId == carOwnerId) {
        filtered.add(photo);
      };
    };
    filtered.toArray();
  };

  public query ({ caller }) func getServicePhotosForCrewMember(crewMemberId : Principal) : async [ServicePhoto] {
    let isCrewMember = crewMembers.containsKey(caller) and caller == crewMemberId;
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    if (not (isCrewMember or isAdmin)) {
      Runtime.trap("Unauthorized: Can only view your own service photos or be an admin");
    };

    let filtered = List.empty<ServicePhoto>();
    for ((_, photo) in servicePhotos.entries()) {
      if (photo.crewMemberId == crewMemberId) {
        filtered.add(photo);
      };
    };
    filtered.toArray();
  };

  public type Notification = {
    id : Text;
    userId : Principal;
    message : Text;
    timestamp : Int;
    read : Bool;
  };

  let notifications = Map.empty<Principal, List.List<Notification>>();
  var notificationCounter : Nat = 0;

  func createNotification(userId : Principal, message : Text) {
    notificationCounter := notificationCounter + 1;
    let notification : Notification = {
      id = notificationCounter.toText();
      userId;
      message;
      timestamp = Time.now();
      read = false;
    };

    let existingNotifications = switch (notifications.get(userId)) {
      case (null) { List.empty<Notification>() };
      case (?notifs) { notifs };
    };

    existingNotifications.add(notification);
    notifications.add(userId, existingNotifications);
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view notifications");
    };

    switch (notifications.get(caller)) {
      case (null) { [] };
      case (?notifs) { notifs.toArray() };
    };
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can mark notifications as read");
    };

    switch (notifications.get(caller)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?notifs) {
        let updatedNotifs = List.empty<Notification>();
        var found = false;

        for (notif in notifs.values()) {
          if (notif.id == notificationId) {
            found := true;
            updatedNotifs.add({
              id = notif.id;
              userId = notif.userId;
              message = notif.message;
              timestamp = notif.timestamp;
              read = true;
            });
          } else {
            updatedNotifs.add(notif);
          };
        };

        if (not found) {
          Runtime.trap("Notification not found");
        };

        notifications.add(caller, updatedNotifs);
      };
    };
  };

  public shared ({ caller }) func registerCarOwner(name : Text, email : Text, phone : Text, carNumber : Text, carModel : Text, carType : CarType) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register as car owners");
    };

    if (carOwners.containsKey(caller)) {
      Runtime.trap("Car owner already registered");
    };

    let profile : CarOwnerProfile = {
      name;
      email;
      phone;
      carNumber;
      carModel;
      carType;
      priceSegment = getPriceSegment(carType);
      subscriptionActive = true;
      registrationDate = Time.now();
    };

    carOwners.add(caller, profile);
  };

  func getPriceSegment(carType : CarType) : Nat {
    switch (carType) {
      case (#SUV) { 449 };
      case (#hatchback or #sedan or #midSUV) { 399 };
    };
  };

  public shared ({ caller }) func registerCrewMember(name : Text, email : Text, phone : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register as crew members");
    };

    if (crewMembers.containsKey(caller)) {
      Runtime.trap("Crew member already registered");
    };

    let profile : CrewMemberProfile = {
      name;
      email;
      phone;
      isActive = false;
      approvalStatus = #pending;
    };

    crewMembers.add(caller, profile);
  };

  public shared ({ caller }) func approveCrewMember(crewMemberId : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve crew members");
    };

    switch (crewMembers.get(crewMemberId)) {
      case (null) { Runtime.trap("Approval failed: Crew member not found") };
      case (?profile) {
        if (profile.approvalStatus == #approved) {
          Runtime.trap("Crew member already approved");
        };

        let updatedProfile = {
          name = profile.name;
          email = profile.email;
          phone = profile.phone;
          isActive = true;
          approvalStatus = #approved;
        };

        crewMembers.add(crewMemberId, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func rejectCrewMember(crewMemberId : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reject crew members");
    };

    switch (crewMembers.get(crewMemberId)) {
      case (null) { Runtime.trap("Rejection failed: Crew member not found") };
      case (?profile) {
        if (profile.approvalStatus == #rejected) {
          Runtime.trap("Crew member already rejected");
        };

        let updatedProfile = {
          name = profile.name;
          email = profile.email;
          phone = profile.phone;
          isActive = false;
          approvalStatus = #rejected;
        };

        crewMembers.add(crewMemberId, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getCarOwnerProfile(id : Principal) : async CarOwnerProfile {
    if (caller != id and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or be an admin");
    };
    switch (carOwners.get(id)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Car owner not found") };
    };
  };

  public query ({ caller }) func getCrewMemberProfile(id : Principal) : async CrewMemberProfile {
    if (caller != id and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or be an admin");
    };
    switch (crewMembers.get(id)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Crew member not found") };
    };
  };

  public query ({ caller }) func getAllCarOwners() : async [CarOwnerProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access this function");
    };
    carOwners.values().toArray();
  };

  public query ({ caller }) func getAllCrewMembers() : async [CrewMemberProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access this function");
    };
    crewMembers.values().toArray();
  };

  public shared ({ caller }) func assignCarOwnerToCrewMember(carOwnerId : Principal, crewMemberId : Principal, date : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access this function");
    };

    if (not carOwners.containsKey(carOwnerId)) {
      Runtime.trap("Car owner not found");
    };

    if (not crewMembers.containsKey(crewMemberId)) {
      Runtime.trap("Crew member not found");
    };

    let assignment : Assignment = {
      carOwnerId;
      crewMemberId;
      date;
      status = #pending;
    };

    assignments.add(assignment);

    createNotification(carOwnerId, "You have been assigned to a crew member for " # date);
  };

  public shared ({ caller }) func skipDay(date : Text) : async () {
    if (not carOwners.containsKey(caller)) {
      Runtime.trap("Unauthorized: Only car owners can skip days");
    };

    let currentSkips = switch (skipDays.get(caller)) {
      case (?days) { days };
      case (null) { List.empty<Text>() };
    };

    if (currentSkips.size() >= 4) {
      Runtime.trap("Maximum 4 skip days per month");
    };

    if (currentSkips.values().any(func(day) { day == date })) {
      Runtime.trap("Day already skipped");
    };

    currentSkips.add(date);

    skipDays.add(caller, currentSkips);

    let newAssignments = assignments.map<Assignment, Assignment>(
      func(assignment) {
        if (assignment.carOwnerId == caller and assignment.date == date) {
          {
            carOwnerId = assignment.carOwnerId;
            crewMemberId = assignment.crewMemberId;
            date = assignment.date;
            status = #skipped;
          };
        } else {
          assignment;
        };
      }
    );

    assignments.clear();
    assignments.addAll(newAssignments.values());
  };

  public query ({ caller }) func getSkipDays(user : Principal) : async [Text] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own skip days or be an admin");
    };
    switch (skipDays.get(user)) {
      case (?days) { days.toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getScheduleForUser(user : Principal) : async [Assignment] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own schedule or be an admin");
    };
    assignments.toArray().filter(func(assignment) { assignment.carOwnerId == user });
  };

  public query ({ caller }) func getAssignmentsForCrewMember(crewMemberId : Principal, date : Text) : async [Assignment] {
    if (caller != crewMemberId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own assignments or be an admin");
    };
    assignments.toArray().filter(func(assignment) { assignment.crewMemberId == crewMemberId and assignment.date == date });
  };

  public query ({ caller }) func getDailySchedule(date : Text) : async [Assignment] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access this function");
    };
    assignments.toArray().filter(func(assignment) { assignment.date == date });
  };

  public shared ({ caller }) func updateAssignmentStatus(carOwnerId : Principal, date : Text, newStatus : AssignmentStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access this function");
    };

    let newAssignments = assignments.map<Assignment, Assignment>(
      func(assignment) {
        if (assignment.carOwnerId == carOwnerId and assignment.date == date) {
          {
            carOwnerId = assignment.carOwnerId;
            crewMemberId = assignment.crewMemberId;
            date = assignment.date;
            status = newStatus;
          };
        } else {
          assignment;
        };
      }
    );

    assignments.clear();
    assignments.addAll(newAssignments.values());
  };

  public shared ({ caller }) func markAssignmentDone(carOwnerId : Principal, date : Text) : async () {
    switch (crewMembers.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: Only crew members can mark assignments as done");
      };
      case (?profile) {
        if (profile.approvalStatus != #approved or not profile.isActive) {
          Runtime.trap("Unauthorized: Only approved and active crew members can mark assignments as done");
        };
      };
    };

    let assignmentExists = assignments.toArray().any(
      func(assignment) {
        assignment.carOwnerId == carOwnerId and assignment.date == date and assignment.crewMemberId == caller
      }
    );

    if (not assignmentExists) {
      Runtime.trap("Unauthorized: Assignment not found or not assigned to you");
    };

    let newAssignments = assignments.map<Assignment, Assignment>(
      func(assignment) {
        if (assignment.carOwnerId == carOwnerId and assignment.date == date and assignment.crewMemberId == caller) {
          {
            carOwnerId = assignment.carOwnerId;
            crewMemberId = assignment.crewMemberId;
            date = assignment.date;
            status = #done;
          };
        } else {
          assignment;
        };
      }
    );

    assignments.clear();
    assignments.addAll(newAssignments.values());

    createNotification(carOwnerId, "Your car cleaning service for " # date # " has been completed");
  };

  public query ({ caller }) func getActiveCrewMembers() : async ([(Principal, CrewMemberProfile)], Nat) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access this function");
    };
    let active = crewMembers.filter(
      func(_p, profile) {
        profile.isActive;
      }
    );
    (active.toArray(), active.size());
  };

  public query ({ caller }) func getActiveCarOwners() : async ([(Principal, CarOwnerProfile)], Nat) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access this function");
    };
    let active = carOwners.filter(
      func(_p, profile) {
        profile.subscriptionActive;
      }
    );
    (active.toArray(), active.size());
  };

  public shared ({ caller }) func addBulkAssignments(newAssignments : [(Principal, Principal)]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access this function");
    };

    for ((carOwner, crewMember) in newAssignments.values()) {
      let assignment : Assignment = {
        carOwnerId = carOwner;
        crewMemberId = crewMember;
        date = "2024-07-01";
        status = #pending;
      };
      assignments.add(assignment);
    };
  };

  public shared ({ caller }) func updateSubscriptionStatus(action : Text) : async () {
    if (not carOwners.containsKey(caller)) {
      Runtime.trap("Unauthorized: Only car owners can update subscription status");
    };

    switch (carOwners.get(caller)) {
      case (null) { Runtime.trap("Car owner not found") };
      case (?profile) {
        let newStatus = switch (action) {
          case ("activate") { true };
          case ("deactivate") { false };
          case (_) { Runtime.trap("Invalid action: " # action) };
        };
        let updatedProfile = {
          name = profile.name;
          email = profile.email;
          phone = profile.phone;
          carNumber = profile.carNumber;
          carModel = profile.carModel;
          carType = profile.carType;
          priceSegment = profile.priceSegment;
          subscriptionActive = newStatus;
          registrationDate = profile.registrationDate;
        };

        carOwners.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func wipeAllSkipDays() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    skipDays.clear();
  };

  public shared func submitWaitlist(name : Text, email : Text, phone : Text, carModel : Text, sectorSociety : Text, carsInFamily : Nat) : async () {
    let entry : WaitlistEntry = {
      name;
      email;
      phone;
      carModel;
      sectorSociety;
      carsInFamily;
      submittedAt = Time.now();
    };
    waitlistEntries.add(entry);
  };

  public query ({ caller }) func getWaitlistEntries() : async [WaitlistEntry] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access waitlist entries");
    };
    waitlistEntries.toArray();
  };

  public query func getWaitlistCount() : async Nat {
    waitlistEntries.size();
  };

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe config");
    };
    stripeConfig := ?config;
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be configured") };
      case (?config) { config };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not carOwners.containsKey(caller)) {
      Runtime.trap("Unauthorized: Only car owners can create checkout sessions");
    };

    let sessionId = await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
    checkoutSessions.add(sessionId, caller);
    sessionId;
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    switch (checkoutSessions.get(sessionId)) {
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Session not found or access denied");
        };
      };
      case (?owner) {
        if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own session status or be an admin");
        };
      };
    };
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public shared ({ caller }) func recordPayment(carOwnerId : Principal, amount : Nat, currency : Text, sessionId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can record payments");
    };

    let payment : PaymentRecord = {
      amount;
      currency;
      timestamp = Time.now();
      status = "completed";
      sessionId;
    };

    let currentPayments = switch (payments.get(carOwnerId)) {
      case (?records) { records };
      case (null) { List.empty<PaymentRecord>() };
    };

    currentPayments.add(payment);
    payments.add(carOwnerId, currentPayments);
  };

  public query ({ caller }) func getPaymentHistory(user : Principal) : async [PaymentRecord] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own payment history or be an admin");
    };
    switch (payments.get(user)) {
      case (?records) { records.toArray() };
      case (null) { [] };
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
