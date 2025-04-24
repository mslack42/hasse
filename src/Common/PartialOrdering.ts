import { OrderingFn, PartialOrderingFn } from "./OrderingFns";
import { Relation } from "./Relation";

export class PartialOrdering {
    static composedFrom<PosetElt>(...fns: OrderingFn<PosetElt>[]): PartialOrderingFn<PosetElt> {
        const partialFns = fns.map(f => this.asPartialOrderingFn(f));
        return (a: PosetElt, b: PosetElt) => {
            if (partialFns.length == 0) return Relation.NA;
            let returnValues: Relation[] = [Relation.NA, Relation.LT, Relation.GT, Relation.EQ];
            let debug = []
            for (const fn of partialFns) {
                const fnVal = fn(a, b)
                debug.push(fnVal)
                if (fnVal == Relation.LT) { returnValues = returnValues.filter(rv => [Relation.LT, Relation.NA].includes(rv)); }
                if (fnVal == Relation.GT) { returnValues = returnValues.filter(rv => [Relation.GT, Relation.NA].includes(rv)); }
                if (fnVal == Relation.NA || returnValues.length == 1) { return Relation.NA; }
            }
            if (returnValues.includes(Relation.EQ)) { 
                return Relation.EQ; }
            if (returnValues.includes(Relation.LT)) { return Relation.LT; }
            if (returnValues.includes(Relation.GT)) { return Relation.GT; }
            return Relation.NA;
        };
    }

    private static asPartialOrderingFn<PosetElt>(fn: OrderingFn<PosetElt>): PartialOrderingFn<PosetElt> {
        return (a: PosetElt, b: PosetElt) => {
            const val = fn(a, b);
            if (typeof val === "number") {
                if (val < 0) return Relation.LT;
                if (val > 0) return Relation.GT;
                return Relation.EQ;
            }
            return val;
        };
    }
}
