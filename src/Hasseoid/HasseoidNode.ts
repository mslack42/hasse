import { randomUUID, UUID } from 'crypto';

export class HasseoidNode<PosetElt> {
    constructor() {
        this.nodeId = randomUUID()
    }
    values: PosetElt[];
    successors: HasseoidNode<PosetElt>[];
    predecessors: HasseoidNode<PosetElt>[];
    public readonly nodeId: UUID;
}
