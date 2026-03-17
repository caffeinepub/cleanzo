import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Assignment {
    status: AssignmentStatus;
    date: string;
    crewMemberId: Principal;
    carOwnerId: Principal;
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
export interface CrewMemberProfile {
    name: string;
    isActive: boolean;
    phone: string;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignCarOwnerToCrewMember(carOwnerId: Principal, crewMemberId: Principal, date: string): Promise<void>;
    getActiveCarOwners(): Promise<[Array<[Principal, CarOwnerProfile]>, bigint]>;
    getActiveCrewMembers(): Promise<[Array<[Principal, CrewMemberProfile]>, bigint]>;
    getAllCarOwners(): Promise<Array<CarOwnerProfile>>;
    getAllCrewMembers(): Promise<Array<CrewMemberProfile>>;
    getAssignmentsForCrewMember(crewMemberId: Principal, date: string): Promise<Array<Assignment>>;
    getCallerUserRole(): Promise<UserRole>;
    getCarOwnerProfile(id: Principal): Promise<CarOwnerProfile>;
    getCrewMemberProfile(id: Principal): Promise<CrewMemberProfile>;
    getDailySchedule(date: string): Promise<Array<Assignment>>;
    getScheduleForUser(user: Principal): Promise<Array<Assignment>>;
    getSkipDays(user: Principal): Promise<Array<string>>;
    isCallerAdmin(): Promise<boolean>;
    markAssignmentDone(carOwnerId: Principal, date: string): Promise<void>;
    registerCarOwner(name: string, email: string, phone: string, carNumber: string, carModel: string, carType: CarType): Promise<void>;
    registerCrewMember(name: string, phone: string): Promise<void>;
    skipDay(date: string): Promise<void>;
    updateAssignmentStatus(carOwnerId: Principal, date: string, newStatus: AssignmentStatus): Promise<void>;
    updateSubscriptionStatus(action: string): Promise<void>;
    wipeAllSkipDays(): Promise<void>;
}
