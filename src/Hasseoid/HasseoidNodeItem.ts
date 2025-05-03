import { randomUUID, UUID } from 'crypto';

export class HasseoidNodeItem<PosetElt> {
    constructor(value?: PosetElt) {
        this.itemId = randomUUID();
        this.value = value
    }
    public readonly itemId: UUID;
    value: PosetElt;
}
