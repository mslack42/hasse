import { HasseoidNode } from "./HasseoidNode";
import { Relation } from "../Common/Relation";
import { PartialOrderingFn } from "../Common/OrderingFns";
import { UUID } from "crypto";
import { HasseoidNodeItem } from "./HasseoidNodeItem";

export class Hasseoid<PosetElt> {
    constructor(partialOrderingFn: PartialOrderingFn<PosetElt>, identityFn?: (a: PosetElt, b: PosetElt) => boolean) {
        this.partialOrdering = partialOrderingFn;
        this.identity = identityFn ?? this.identity;
    }

    private partialOrdering: PartialOrderingFn<PosetElt>;
    private identity: (a: PosetElt, b: PosetElt) => boolean = (a, b) => (a == b);
    public elements: HasseoidNode<PosetElt>[] = [];

    public minima(): HasseoidNode<PosetElt>[] {
        return this.elements.filter(e => e.predecessors.length == 0);
    }

    public maxima(): HasseoidNode<PosetElt>[] {
        return this.elements.filter(e => e.successors.length == 0);
    }

    public add(elt: PosetElt) {
        var succs: Set<HasseoidNode<PosetElt>> = new Set();
        var priors: Set<HasseoidNode<PosetElt>> = new Set();
        var wrappedElt = new HasseoidNodeItem(elt);
        const trawlUpwards = ([lower, upper]: [HasseoidNode<PosetElt>, HasseoidNode<PosetElt>]): void => {
            const comp = this.partialOrdering(wrappedElt.value, upper.values[0].value);
            if (comp == Relation.EQ) {
                upper.values.push(wrappedElt);
                return;
            }
            if (comp == Relation.LT) {
                succs.add(upper);
                if (lower) priors.add(lower);
                return;
            }
            if (comp == Relation.NA && lower) {
                priors.add(lower);
            }
            if (comp == Relation.GT) {
                const nexts = upper.successors;
                for (const n of nexts) {
                    trawlUpwards([upper, n]);
                }
            }
        };
        const trawlDownwards = ([lower, upper]: [HasseoidNode<PosetElt>, HasseoidNode<PosetElt>]): void => {
            const comp = this.partialOrdering(wrappedElt.value, lower.values[0].value);
            if (comp == Relation.EQ) {
                lower.values.push(wrappedElt);
                return;
            }
            if (comp == Relation.GT) {
                priors.add(lower);
                if (upper) succs.add(upper);
                return;
            }
            if (comp == Relation.NA && upper) {
                succs.add(upper);
            }
            if (comp == Relation.LT) {
                const nexts = lower.successors;
                for (const n of nexts) {
                    trawlDownwards([n, lower]);
                }
            }
        };
        if (this.elements.length > 0) {
            const initialMinima = this.minima();
            const initialMaxima = this.maxima();
            for (const e of initialMinima) {
                trawlUpwards([null, e]);
            }
            for (const e of initialMaxima) {
                trawlDownwards([e, null]);
            }
        }
        if (this.elements.filter(e => e.values.filter(v => v.itemId == wrappedElt.itemId).length > 0).length > 0) {
            return;
        }
        // At this point hopefully succs and priors are populated fully and minimally
        const newNode = new HasseoidNode<PosetElt>();
        newNode.values = [wrappedElt];
        newNode.predecessors = [...priors];
        newNode.successors = [...succs];

        // Need to update nodes in this lists as per transitive reduction
        for (const p of newNode.predecessors) {
            p.successors = [newNode, ...p.successors.filter(s => !newNode.successors.includes(s))];
        }
        for (const s of newNode.successors) {
            s.predecessors = [newNode, ...s.predecessors.filter(s => !newNode.predecessors.includes(s))];
        }
        this.elements.push(newNode);
    }

    public addMany(...elts: PosetElt[]) {
        for (const elt of elts) {
            this.add(elt);
        }
    }

    private removeNode(match: HasseoidNode<PosetElt>) {
        for (const p of match.predecessors) {
            p.successors = p.successors.filter(x => x != match);
        }
        for (const s of match.successors) {
            s.predecessors = s.predecessors.filter(x => x != match);
        }
        for (const p of match.predecessors) {
            for (const s of match.successors) {
                if (p.successors.filter(x => s.predecessors.includes(x)).length == 0) {
                    p.successors.push(s);
                    s.predecessors.push(p);
                }
            }
        }
        this.elements = this.elements.filter(e => e != match);
    }

    public removeByNodeId(nodeId: UUID, groupId?: UUID) {
        let groupMatches: HasseoidNode<PosetElt>[];
        if (groupId) {
            groupMatches = this.elements.filter(e => e.nodeId == groupId)
        } else {
            groupMatches = this.elements.filter(e => e.values.filter(v => v.itemId == nodeId).length > 0)
        }
        if (groupMatches.length > 0) {
            const match = groupMatches[0];
            match.values = match.values.filter(v => v.itemId == nodeId);
            if (match.values.length > 0) {
                return;
            }

            this.removeNode(match)
        }
    }

    public remove(elt: PosetElt) {
        const groupMatches = this.elements.filter(e => e.values.filter(v => this.identity(v.value, elt)).length > 0);
        if (groupMatches.length > 0) {
            const match = groupMatches[0];
            match.values = match.values.filter(v => !this.identity(v.value, elt));
            if (match.values.length > 0) {
                return;
            }

            this.removeNode(match)
        }
    }

    public removeMany(...elts: PosetElt[]) {
        for (const elt of elts) {
            this.remove(elt);
        }
    }

    public removeManyByNodeId(nodeIds: UUID[]) {
        for (const nodeId of nodeIds) {
            this.removeByNodeId(nodeId)
        }
    }

    public getNodeFromElt(elt: PosetElt) {
        const matches = this.elements.filter(e => e.values.filter(v => this.identity(v.value, elt)).length > 0)
        if (matches.length > 0) {
            return matches[0]
        }
        return null
    }

    public getNodeFromNodeId(id: UUID) {
        const matches = this.elements.filter(e => e.nodeId == id)
        if (matches.length > 0) {
            return matches[0]
        }
        return null
    }
}
