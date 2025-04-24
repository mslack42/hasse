import { randomUUID, UUID } from 'crypto';

export class HasseNode<PosetElt> {
    constructor(){
        this.nodeId = randomUUID()
    }
    value: PosetElt;
    successors: HasseNode<PosetElt>[];
    predecessors: HasseNode<PosetElt>[];
    public readonly nodeId: UUID;
}
