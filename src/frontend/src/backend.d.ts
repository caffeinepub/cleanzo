import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WeeklyPaySummary {
    records: Array<AttendanceRecord>;
    totalHours: number;
    crewMemberId: Principal;
    weekStart: string;
}
export interface PayRelease {
    totalHours: number;
    crewMemberId: Principal;
    releasedAt: bigint;
    amount: bigint;
    weekStart: string;
}
export interface CrewMemberProfile {
    name: string;
    isActive: boolean;
    email: string;
    approvalStatus: ApprovalStatus;
    phone: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface PaymentRecord {
    status: string;
    currency: string;
    timestamp: bigint;
    sessionId: string;
    amount: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface WaitlistEntry {
    carModel: string;
    name: string;
    sectorSociety: string;
    submittedAt: bigint;
    email: string;
    phone: string;
    carsInFamily: bigint;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface CarOwnerProfile {
    carModel: string;
    name: string;
    email: string;
    subscriptionActive: boolean;
    carNumber: string;
    priceSegment: bigint;
    carType: CarType;
    phone: string;
    registrationDate: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Notification {
    id: string;
    userId: Principal;
    read: boolean;
    message: string;
    timestamp: bigint;
}
export interface Assignment {
    status: AssignmentStatus;
    date: string;
    crewMemberId: Principal;
    carOwnerId: Principal;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface AttendanceRecord {
    date: string;
    hoursWorked?: number;
    clockOut?: bigint;
    clockIn: bigint;
}
export interface ServicePhoto {
    id: string;
    date: string;
    crewMemberId: Principal;
    beforePhotoId: string;
    carOwnerId: Principal;
    afterPhotoId: string;
    uploadedAt: bigint;
}
export interface UserProfile {
    name: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum AssignmentStatus {
    pending = "pending",
    skipped = "skipped",
    done = "done"
}
export enum CarType {
    SUV = "SUV",
    midSUV = "midSUV",
    sedan = "sedan",
    hatchback = "hatchback"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBulkAssignments(newAssignments: Array<[Principal, Principal]>): Promise<void>;
    approveCrewMember(crewMemberId: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignCarOwnerToCrewMember(carOwnerId: Principal, crewMemberId: Principal, date: string): Promise<void>;
    clockIn(date: string): Promise<void>;
    clockOut(date: string): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    getActiveCarOwners(): Promise<[Array<[Principal, CarOwnerProfile]>, bigint]>;
    getActiveCrewMembers(): Promise<[Array<[Principal, CrewMemberProfile]>, bigint]>;
    getAllCarOwners(): Promise<Array<CarOwnerProfile>>;
    getAllCrewMembers(): Promise<Array<CrewMemberProfile>>;
    getAssignmentsForCrewMember(crewMemberId: Principal, date: string): Promise<Array<Assignment>>;
    getAttendanceLogs(crewMemberId: Principal): Promise<Array<AttendanceRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCarOwnerProfile(id: Principal): Promise<CarOwnerProfile>;
    getCrewMemberProfile(id: Principal): Promise<CrewMemberProfile>;
    getDailySchedule(date: string): Promise<Array<Assignment>>;
    getNotifications(): Promise<Array<Notification>>;
    getPayReleaseHistory(crewMemberId: Principal): Promise<Array<PayRelease>>;
    getPaymentHistory(user: Principal): Promise<Array<PaymentRecord>>;
    getScheduleForUser(user: Principal): Promise<Array<Assignment>>;
    getServicePhoto(carOwnerId: Principal, crewMemberId: Principal, date: string): Promise<ServicePhoto | null>;
    getServicePhotosForCarOwner(carOwnerId: Principal): Promise<Array<ServicePhoto>>;
    getServicePhotosForCrewMember(crewMemberId: Principal): Promise<Array<ServicePhoto>>;
    getSkipDays(user: Principal): Promise<Array<string>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWaitlistCount(): Promise<bigint>;
    getWaitlistEntries(): Promise<Array<WaitlistEntry>>;
    getWeeklyHoursSummary(crewMemberId: Principal, weekStart: string): Promise<WeeklyPaySummary>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    markAssignmentDone(carOwnerId: Principal, date: string): Promise<void>;
    markNotificationAsRead(notificationId: string): Promise<void>;
    recordPayment(carOwnerId: Principal, amount: bigint, currency: string, sessionId: string): Promise<void>;
    registerCarOwner(name: string, email: string, phone: string, carNumber: string, carModel: string, carType: CarType): Promise<void>;
    registerCrewMember(name: string, email: string, phone: string): Promise<void>;
    rejectCrewMember(crewMemberId: Principal): Promise<void>;
    releaseWeeklyPayment(crewMemberId: Principal, weekStart: string, amount: bigint, totalHours: number): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveServicePhoto(carOwnerId: Principal, date: string, beforePhotoId: string, afterPhotoId: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    skipDay(date: string): Promise<void>;
    submitWaitlist(name: string, email: string, phone: string, carModel: string, sectorSociety: string, carsInFamily: bigint): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAssignmentStatus(carOwnerId: Principal, date: string, newStatus: AssignmentStatus): Promise<void>;
    updateSubscriptionStatus(action: string): Promise<void>;
    wipeAllSkipDays(): Promise<void>;
}
