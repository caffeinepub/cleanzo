import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  type PaymentRecord = {
    amount : Nat;
    currency : Text;
    timestamp : Int;
    status : Text;
    sessionId : Text;
  };
  type OldActor = {};
  type NewActor = {
    payments : Map.Map<Principal, List.List<PaymentRecord>>;
    checkoutSessions : Map.Map<Text, Principal>;
  };

  public func run(_ : OldActor) : NewActor {
    // Empty maps for existing canisters.
    {
      payments = Map.empty<Principal, List.List<PaymentRecord>>();
      checkoutSessions = Map.empty<Text, Principal>();
    };
  };
};
