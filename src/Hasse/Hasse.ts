import { HasseNode } from "./HasseNode";
import { Relation } from "../Common/Relation";
import { PartialOrderingFn } from "../Common/OrderingFns";
import { UUID } from "crypto";

export class Hasse<PosetElt> {
    constructor(partialOrderingFn: PartialOrderingFn<PosetElt>, identityFn?: (a: PosetElt, b: PosetElt) => boolean) {
        this.partialOrdering = partialOrderingFn;
        this.identity = identityFn ?? this.identity;
    }

    private partialOrdering: PartialOrderingFn<PosetElt>;
    private identity: (a: PosetElt, b: PosetElt) => boolean = (a, b) => (a == b);
    public elements: HasseNode<PosetElt>[] = [];

    public minima(): HasseNode<PosetElt>[] {
        return this.elements.filter(e => e.predecessors.length == 0);
    }

    public maxima(): HasseNode<PosetElt>[] {
        return this.elements.filter(e => e.successors.length == 0);
    }

    public add(elt: PosetElt) {
        var succs: Set<HasseNode<PosetElt>> = new Set();
        var priors: Set<HasseNode<PosetElt>> = new Set();
        const trawlUpwards = ([lower, upper]: [HasseNode<PosetElt>, HasseNode<PosetElt>]): void => {
            const comp = this.partialOrdering(elt, upper.value);
            if (comp == Relation.EQ) {
                throw Error("Duplicate element encountered")
            }
            if (comp == Relation.LT) {
                succs.add(upper);
                if (lower) priors.add(lower)
                return
            }
            if (comp == Relation.NA && lower) {
                priors.add(lower)
            }
            if (comp == Relation.GT) {
                const nexts = upper.successors;
                for (const n of nexts) {
                    trawlUpwards([upper, n])
                }
            }
        };
        const trawlDownwards = ([lower, upper]: [HasseNode<PosetElt>, HasseNode<PosetElt>]): void => {
            const comp = this.partialOrdering(elt, lower.value);
            if (comp == Relation.EQ) {
                throw Error("Duplicate element encountered")
            }
            if (comp == Relation.GT) {
                priors.add(lower);
                if (upper) succs.add(upper)
                return
            }
            if (comp == Relation.NA && upper) {
                succs.add(upper)
            }
            if (comp == Relation.LT) {
                const nexts = lower.successors;
                for (const n of nexts) {
                    trawlDownwards([n, lower])
                }
            }
        };
        if (this.elements.length > 0) {
            const initialMinima = this.minima();
            const initialMaxima = this.maxima();
            for (const e of initialMinima) {
                trawlUpwards([null, e])
            }
            for (const e of initialMaxima) {
                trawlDownwards([e, null])
            }
        }
        // At this point hopefully succs and priors are populated fully and minimally
        const newNode = new HasseNode<PosetElt>();
        newNode.value = elt;
        newNode.predecessors = [...priors];
        newNode.successors = [...succs];

        // Need to update nodes in this lists as per transitive reduction
        for (const p of newNode.predecessors) {
            p.successors = [newNode, ...p.successors.filter(s => !newNode.successors.includes(s))]
        }
        for (const s of newNode.successors) {
            s.predecessors = [newNode, ...s.predecessors.filter(s => !newNode.predecessors.includes(s))]
        }
        this.elements.push(newNode);
    }

    public addMany(...elts: PosetElt[]) {
        for (const elt of elts) {
            this.add(elt);
        }
    }

    public remove(elt: PosetElt) {
        const matches = this.elements.filter(e => this.identity(e.value, elt))
        if (matches.length > 0) {
            const match = matches[0]

            for (const p of match.predecessors) {
                p.successors = p.successors.filter(x => x != match)
            }
            for (const s of match.successors) {
                s.predecessors = s.predecessors.filter(x => x != match)
            }
            for (const p of match.predecessors) {
                for (const s of match.successors) {
                    if (p.successors.filter(x => s.predecessors.includes(x)).length == 0) {
                        p.successors.push(s)
                        s.predecessors.push(p)
                    }
                }
            }
            this.elements = this.elements.filter(e => e != match)
        }
    }

    public removeMany(...elts: PosetElt[]) {
        for (const elt of elts) {
            this.remove(elt);
        }
    }

    public getNodeFromElt(elt:PosetElt) {
        const matches= this.elements.filter(e => this.identity(e.value,elt))
        if (matches.length > 0) {
            return matches[0]
        }
        return null
    }

    public getNodeFromNodeId(id: UUID) {
        const matches= this.elements.filter(e => e.nodeId == id)
        if (matches.length > 0) {
            return matches[0]
        }
        return null
    }
}
