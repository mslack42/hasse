import { PartialOrdering } from "../src/Common/PartialOrdering"
import { Hasseoid } from "../src/Hasseoid/Hasseoid"
import { Relation } from "../src/Common/Relation"

const ThreeFourCoordinateSumPO = PartialOrdering.composedFrom<[number, number, number]>(
  (a, b) => a.reduce((x,y) => x+y) - b.reduce((x,y) => x+y),
)

describe('testing some simple partial orderings', () => {
  test('simple coordinate-based one', () => {
    const po = ThreeFourCoordinateSumPO
    expect(po([0, 0, 0], [1, 0, 0])).toBe(Relation.LT)
    expect(po([1, 0, 0], [0, 0, 0])).toBe(Relation.GT)
    expect(po([1, 2, 3], [2, 3, 4])).toBe(Relation.LT)
    expect(po([0, 2, 3], [1, 2, 3])).toBe(Relation.LT)
    expect(po([3, 2, 3], [1, 3, 3])).toBe(Relation.GT)
    expect(po([0, 0, 0], [0, 1, 0])).toBe(Relation.LT)
    expect(po([1, 0, 0], [0, 0, 1])).toBe(Relation.EQ)
  })
})

describe('testing some simple Hasse diagrams', () => {
  test('simple coordinate-based one', () => {
    const hasseoid = new Hasseoid(ThreeFourCoordinateSumPO)

    const elements: [number, number, number][] = []
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        for (var k = 0; k < 4; k++) {
          elements.push([i, j, k])
        }
      }
    }

    hasseoid.addMany(...elements)

    expect(hasseoid.elements.length).toBe((3+3+3) - (0) + 1)
    const maxima = hasseoid.maxima()
    expect(maxima.length).toBe(1)
    expect(maxima[0].values.length).toBe(1)
    const minima = hasseoid.minima()
    expect(minima.length).toBe(1)
    expect(minima[0].values.length).toBe(1)
  });
});

const TwoTwoCoordinatePO = PartialOrdering.composedFrom<[number, number]>(
  (a, b) => a.reduce((x,y) => x+y) - b.reduce((x,y) => x+y),
)

describe('testing deleting items from diagram', () => {
  test('gap filling', () => {
    const hasseoid = new Hasseoid(TwoTwoCoordinatePO, (a,b) => a[0] == b[0] && a[1] == b[1])

    const elements: [number, number][] = []
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        elements.push([i, j])
      }
    }

    hasseoid.addMany(...elements)

    expect(hasseoid.elements.length).toBe(5)
    expect(hasseoid.elements.map(e => e.predecessors.length + e.successors.length).reduce((a,b) => a+b)).toBe(8)
    expect(hasseoid.getNodeFromElt([1,1])).not.toBeNull()

    hasseoid.remove([1,1])
    expect(hasseoid.elements.length).toBe(5)
    hasseoid.remove([0,2])
    expect(hasseoid.elements.length).toBe(5)
    hasseoid.remove([2,0])
    expect(hasseoid.elements.length).toBe(4)
    expect(hasseoid.getNodeFromElt([1,1])).toBeNull()
    expect(hasseoid.elements.map(e => e.predecessors.length + e.successors.length).reduce((a,b) => a+b)).toBe(6)
  })
})