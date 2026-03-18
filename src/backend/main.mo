import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


// Specify data migration function in with-clause

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  public type CrewMemberProfile = {
    name : Text;
    phone : Text;
    isActive : Bool;
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

  module Assignment {
    public func compare(a : Assignment, b : Assignment) : Order.Order {
      switch (Text.compare(a.date, b.date)) {
        case (#equal) { Principal.compare(a.carOwnerId, b.carOwnerId) };
        case (order) { order };
      };
    };
  };

  func getPriceSegment(carType : CarType) : Nat {
    switch (carType) {
      case (#SUV) { 449 };
      case (#hatchback or #sedan or #midSUV) { 399 };
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

  public shared ({ caller }) func registerCrewMember(name : Text, phone : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register as crew members");
    };

    if (crewMembers.containsKey(caller)) {
      Runtime.trap("Crew member already registered");
    };

    let profile : CrewMemberProfile = {
      name;
      phone;
      isActive = true;
    };

    crewMembers.add(caller, profile);
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
    if (not crewMembers.containsKey(caller)) {
      Runtime.trap("Unauthorized: Only crew members can mark assignments as done");
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

  // Waitlist
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

  // Stripe Payment Integration
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

  // Changed from query to shared to allow await on Stripe.getSessionStatus.
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
};
