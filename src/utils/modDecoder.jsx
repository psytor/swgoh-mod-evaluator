export function decodeModData(compactMod) {
  return {
    id: compactMod.id,
    definitionId: compactMod.d,
    level: compactMod.l,
    tier: compactMod.t,
    locked: compactMod.k,
    characterName: compactMod.c,
    characterDisplayName: compactMod.cn,
    primaryStat: {
      stat: {
        unitStatId: compactMod.p.i,
        statValueDecimal: (compactMod.p.v * 10000).toString()
      }
    },
    secondaryStat: compactMod.s.map(stat => ({
      stat: {
        unitStatId: stat.i,
        statValueDecimal: (stat.v * 10000).toString()
      },
      statRolls: stat.r,
      efficiency: stat.e,
      rollEfficiencies: stat.re
    })),
    efficiency: compactMod.e
  };
}