// Return a list of the star points positions for the given size
export function getStarPoints(boardSize: number): { x: number; y: number }[] {
  if (boardSize < 7) return [];

  const third = Math.floor(boardSize / 3);
  const mid = Math.floor(boardSize / 2);

  if (boardSize === 9) {
    return [
      { x: 2, y: 2 }, { x: 6, y: 2 }, { x: 2, y: 6 },
      { x: 6, y: 6 }, { x: 4, y: 4 },
    ];
  }

  if (boardSize === 13) {
    return [
      { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 3, y: 9 },
      { x: 9, y: 9 }, { x: 6, y: 6 },
    ];
  }

  if (boardSize === 19) {
    return [
      { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 15, y: 3 },
      { x: 3, y: 9 }, { x: 9, y: 9 }, { x: 15, y: 9 },
      { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 },
    ];
  }

  // Custom sizes
  return [
    { x: third, y: third },
    { x: boardSize - 1 - third, y: third },
    { x: third, y: boardSize - 1 - third },
    { x: boardSize - 1 - third, y: boardSize - 1 - third },
    { x: mid, y: mid },
  ];
}
