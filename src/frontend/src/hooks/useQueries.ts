import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AssignmentStatus, CarType } from "../backend";
import { useActor } from "./useActor";

export { CarType, AssignmentStatus };

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCarOwnerProfile(id?: Principal) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["carOwnerProfile", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getCarOwnerProfile(id);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCrewMemberProfile(id?: Principal) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["crewMemberProfile", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getCrewMemberProfile(id);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAllCarOwners() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allCarOwners"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCarOwners();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllCrewMembers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allCrewMembers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCrewMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useActiveCarOwners() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["activeCarOwners"],
    queryFn: async () => {
      if (!actor)
        return [[], BigInt(0)] as [
          Array<[Principal, import("../backend").CarOwnerProfile]>,
          bigint,
        ];
      return actor.getActiveCarOwners();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useActiveCrewMembers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["activeCrewMembers"],
    queryFn: async () => {
      if (!actor)
        return [[], BigInt(0)] as [
          Array<[Principal, import("../backend").CrewMemberProfile]>,
          bigint,
        ];
      return actor.getActiveCrewMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDailySchedule(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dailySchedule", date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDailySchedule(date);
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

export function useScheduleForUser(user?: Principal) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["scheduleForUser", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getScheduleForUser(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useSkipDays(user?: Principal) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["skipDays", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getSkipDays(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useCrewAssignments(crewMemberId?: Principal, date?: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["crewAssignments", crewMemberId?.toString(), date],
    queryFn: async () => {
      if (!actor || !crewMemberId || !date) return [];
      return actor.getAssignmentsForCrewMember(crewMemberId, date);
    },
    enabled: !!actor && !isFetching && !!crewMemberId && !!date,
  });
}

export function useRegisterCarOwner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phone: string;
      carNumber: string;
      carModel: string;
      carType: CarType;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.registerCarOwner(
        data.name,
        data.email,
        data.phone,
        data.carNumber,
        data.carModel,
        data.carType,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carOwnerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["userRole"] });
      queryClient.invalidateQueries({ queryKey: ["allCarOwners"] });
    },
  });
}

export function useRegisterCrewMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.registerCrewMember(data.name, data.phone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crewMemberProfile"] });
      queryClient.invalidateQueries({ queryKey: ["userRole"] });
      queryClient.invalidateQueries({ queryKey: ["allCrewMembers"] });
    },
  });
}

export function useSkipDay() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (date: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.skipDay(date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skipDays"] });
      queryClient.invalidateQueries({ queryKey: ["scheduleForUser"] });
    },
  });
}

export function useMarkAssignmentDone() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { carOwnerId: Principal; date: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.markAssignmentDone(data.carOwnerId, data.date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crewAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["dailySchedule"] });
    },
  });
}

export function useAssignCarOwnerToCrewMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      carOwnerId: Principal;
      crewMemberId: Principal;
      date: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.assignCarOwnerToCrewMember(
        data.carOwnerId,
        data.crewMemberId,
        data.date,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailySchedule"] });
      queryClient.invalidateQueries({ queryKey: ["crewAssignments"] });
    },
  });
}

export function useUpdateAssignmentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      carOwnerId: Principal;
      date: string;
      newStatus: AssignmentStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateAssignmentStatus(
        data.carOwnerId,
        data.date,
        data.newStatus,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailySchedule"] });
      queryClient.invalidateQueries({ queryKey: ["crewAssignments"] });
    },
  });
}
