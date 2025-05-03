import { randomUUID, UUID } from 'crypto';
import { HasseoidNodeItem } from './HasseoidNodeItem';

export class HasseoidNode<PosetElt> {
    constructor() {
        this.nodeId = randomUUID()
    }
    values: HasseoidNodeItem<PosetElt>[];
    successors: HasseoidNode<PosetElt>[];
    predecessors: HasseoidNode<PosetElt>[];
    public readonly nodeId: UUID;
}
