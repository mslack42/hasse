## Hasse

A small library for organising a partially-ordered finite sets, in classes designed to correspond to a Hasse diagram.

## Notes

### Hasse
 - Is made up of nodes
 - Each node knows it predecessors and successors
 - Nodes without predecessors are returned by minima()
 - Nodes without successors are returned by maxima()
 - A Hasse instance needs to be initialised with a Partial Ordering. You can also supply an identity function (if you need to distinguish between _identical_ and just _partial ordering equivalent_)

### Partial Ordering
 - Has a helper function to generate a partial ordering function from multiple smaller functions. These smaller functions can also be partial orderings, or the more standard JS sort kind of functions

### Hasseoid
 - A custom variant of the Hasse class. Behaves analogously
 - Nodes consist of multiple elements, with all elements being partial-ordering-equivalent

Hasseoid is the original motivation for this library, as it is the foundation for project ideas revolving around programs that e.g. want to systematically find the best scoring hand of cards in a board game subject to various.