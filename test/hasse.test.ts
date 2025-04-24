import { PartialOrdering } from "../src/Common/PartialOrdering"
import { Relation } from "../src/Common/Relation"
import { Hasse } from "../src/Hasse/Hasse"

const ThreeFourCoordinatePO = PartialOrdering.composedFrom<[number, number, number]>(
  (a, b) => a[0] - b[0],
  (a, b) => a[1] - b[1],
  (a, b) => a[2] - b[2]
)

describe('testing some simple partial orderings', () => {
  test('simple coordinate-based one', () => {
    const po = ThreeFourCoordinatePO
    expect(po([0, 0, 0], [1, 0, 0])).toBe(Relation.LT)
    expect(po([1, 0, 0], [0, 0, 0])).toBe(Relation.GT)
    expect(po([1, 2, 3], [2, 3, 4])).toBe(Relation.LT)
    expect(po([0, 2, 3], [1, 2, 3])).toBe(Relation.LT)
    expect(po([3, 2, 3], [1, 3, 3])).toBe(Relation.NA)
    expect(po([0, 0, 0], [0, 1, 0])).toBe(Relation.LT)
  })
})

describe('testing some simple Hasse diagrams', () => {
  test('simple coordinate-based one', () => {
    const hasse = new Hasse(ThreeFourCoordinatePO)

    const elements: [number, number, number][] = []
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        for (var k = 0; k < 4; k++) {
          elements.push([i, j, k])
        }
      }
    }

    hasse.addMany(...elements)

    expect(hasse.elements.length).toBe(4 * 4 * 4)
    const maxima = hasse.maxima()
    expect(maxima.length).toBe(1)
    const minima = hasse.minima()
    expect(minima.length).toBe(1)
  });
});

const TwoTwoCoordinatePO = PartialOrdering.composedFrom<[number, number]>(
  (a, b) => a[0] - b[0],
  (a, b) => a[1] - b[1],
)

describe('testing deleting items from diagram', () => {
  test('gap filling', () => {
    const hasse = new Hasse(TwoTwoCoordinatePO, (a,b) => a[0] == b[0] && a[1] == b[1])

    const elements: [number, number][] = []
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        elements.push([i, j])
      }
    }

    hasse.addMany(...elements)

    expect(hasse.elements.length).toBe(3 * 3)

    hasse.remove([1,1])
    expect(hasse.elements.length).toBe(3 * 3 - 1)
    expect(hasse.elements.map(e => e.predecessors.length + e.successors.length).reduce((a,b) => a+b)).toBe(24)
    expect(hasse.elements.filter(e => e.value[0] == 1 && e.value[1] == 1).length).toBe(0)
    expect(hasse.elements.filter(e => e.predecessors.filter(p => p.value[0] == 1 && p.value[1] == 1).length > 0).length).toBe(0)
    expect(hasse.elements.filter(e => e.successors.filter(s => s.value[0] == 1 && s.value[1] == 1).length > 0).length).toBe(0)
  })
})