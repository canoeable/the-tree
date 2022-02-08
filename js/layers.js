addLayer("p", { // prestige points
    name: "prestige points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
        if (hasUpgrade('m', 11)) mult = mult.times(upgradeEffect('m', 11))
        if (player.tfl.points.gte(2)) mult = mult.times(tmp.tfl.effect)
        if (player[this.layer].points.gte(100000)) mult = mult.pow(0.7)
        if (player[this.layer].points.gte(10000000)) mult = mult.pow(0.7)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    autoUpgrade() {
        if (hasUpgrade('m', 12)) {
            return true
        } else {
            return false
        }
    },
    passiveGeneration() {
        if (hasUpgrade('m', 13)) {
            return new Decimal (1)
        } else {
            return new Decimal (0)
        }
    },
    directMult() {
        dmult = new Decimal (1)
        if (hasUpgrade('p', 15)) {
            dmult = dmult.times(3)
        } else {
            dmult = dmult
        }
        return dmult
    },
    buyables: { 
        rows: 1, // # of rows 
        cols: 1, // # of columns 
        11: { 
            cost() { 
                return new Decimal(1).mul(new Decimal (10000).pow(getBuyableAmount(this.layer, this.id)))
            },
            title() {
                return "boost"
            },
            display() { 
                return "x10 to points, but increases at x10000. <br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + "<br> Effect: " + format(buyableEffect(this.layer, this.id)) + "x"
            },
            canAfford() { 
                return player[this.layer].points.gte(this.cost()) 
            },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {
                let eff = new Decimal(10).pow((getBuyableAmount(this.layer, this.id)))
                if (hasMilestone('a', 11)) eff = 1
                return eff
            },
            unlocked() {
                if (hasMilestone('a', 11)) {
                    return false
                } else {
                    return true
                }
            }
        },
    },
    upgrades: {
        11: {
            title: "pres11",
            description: "Multiplies points based on prestige points. (prestige points + 1, max x125",
            cost: new Decimal (1),
            effect() {
                if (player[this.layer].points.add(1).gte(125)) {
                    return 125
                } else {
                    return player[this.layer].points.add(1)
                }
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        12: {
            title: "pres12",
            description: "Same effects as pres11, but the multiplier is x0.2. (pres11 * 0.2 + 1, max x50)",
            cost: new Decimal (15),
            effect() {
                if (player[this.layer].points.times(0.2).add(1).gte(50)) {
                    return 50
                } else {
                    return player[this.layer].points.times(0.2).add(1)
                }
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {
                if (hasUpgrade('p', 11)) {
                    return true
                } else {
                    return false
                }
            }
        },
        13: {
            title: "pres13",
            description: "Prestige points boost themselves. (prestige points ^ 0.05 + 1, max x1000",
            cost: new Decimal (1500),
            effect() {
                if (player[this.layer].points.pow(0.05).add(1).gte(1000)) {
                    return 1000
                } else {
                    return player[this.layer].points.pow(0.05).add(1)
                }
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {
                if (hasUpgrade('p', 12)) {
                    return true
                } else {
                    return false
                }
            }
        },
        14: {
            title: "pres14",
            description: "Point gain is multiplied based on prestige points. (1.001 ^ prestige points, max x500)",
            cost: new Decimal (5000),
            effect() {
                if (new Decimal (1.001).pow(player[this.layer].points).gte(500)) {
                    return 500
                } else {
                    return new Decimal (1.001).pow(player[this.layer].points)
                }
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() {
                if (hasUpgrade('p', 13)) {
                    return true
                } else {
                    return false
                }
            }
        },
        15: {
            title: "pres15",
            description: "Multiplies prestige points by 3.",
            cost: new Decimal (600000),
            unlocked() {
                if (hasUpgrade('p', 14)) {
                    return true
                } else {
                    return false
                }
            }
        },
        21: {
            title: "pres21",
            description: "Unlocks point boosts.",
            cost: new Decimal (1),
            unlocked() {
                if (player[this.layer].points.gte(3000000)) {
                    return true
                } else {
                    if (hasUpgrade('p', 21)) {
                        return true 
                    } else {
                        return false
                    }
                }
            }
        },
    },
    doReset(resettingLayer) {
        let keep = [];
        if(hasMilestone('a', 11))keep.push("upgrades");
        if(resettingLayer == 'p')keep.push("points");
        if(resettingLayer == 'p')keep.push("buyables");
        if(resettingLayer == 'p')keep.push("upgrades");
        layerDataReset(this.layer, keep);
    }
})
addLayer("c", { // ???
    name: "Club Access", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CA", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#1e1e1e",
    requires: new Decimal("1e1e100"), // Can be a function that takes requirement increases into account
    resource: "Club Access Cards", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){
        if (player[this.layer].points.gte(1)) {
            return true
        } else {
            return false
        }
    },
    doReset() {
        let keep = [];
        keep.push("points");
        layerDataReset(this.layer, keep);
    }
})
addLayer("Cap Info", { // Caps
    name: "Cap Info", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CI", // This appears on the layer's node. Default is the id with the first letter capitalized
    color: "#4BDC13",
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: "side",
    tooltip: "Cap Info",
    infoboxes: {
        Row1: {
            title: "softcaps",
            body() { return "prestige points: 100,000 and every 2 OoMs after (so 100,000, 10,000,000 etc) the gain is brought to the 0.7th power. point boosts: After 100 and every OoM after that, gain is brought to ^0.9" },
        },
    }
})
addLayer("per", { // perma upgrades
    name: "Permanent Upgrades", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PU", // This appears on the layer's node. Default is the id with the first letter capitalized
    color: "#4BDC13",
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: "side",
    tooltip: "Perma Upgrades",
    upgrades: {
        11: {
            title: "perm11",
            description: "Gain a x4 multiplier to points!",
            cost: new Decimal (125000),
            currencyDisplayName: "prestige points",
            currencyInternalName: "points",
            currencyLayer: "p"
        }
    }
})
addLayer("m", { // point boosts
    name: "point boosts", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() {return player.p.points.gte(3000000)},
		points: new Decimal(0),
    }},
    color: "#047562",
    requires: new Decimal('3000000'), // Can be a function that takes requirement increases into account
    resource: "point boosts", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.88, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (player.tfl.points.gte(3)) mult = mult.times(tmp.tfl.effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "o", description: "O: Reset for point boosts", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        return true
    },
    branches: 'p',
    effect() {
        eff = new Decimal (1)
        eff = eff.mul(player[this.layer].points).mul(3).add(1)
        eff = softcap(eff, new Decimal (350), 0.7)
        eff = softcap(eff, new Decimal (700), 0.5)
        if(eff.gte(1000)) eff = new Decimal (1000)
        return eff
    },
    effectDescription() {
        return "multiplying point gain by " + format(tmp[this.layer].effect)
    },
    directMult() {
        dmult = new Decimal (1)
        dmult = dmult.times(layers.b.effect())
        return dmult
    },
    upgrades: {
        11: {
            title: "upgrades",
            description: "boosts prestige points based on point boosts",
            cost: new Decimal (1),
            effect() {
                if (player[this.layer].points.add(1).gte(10)) {
                    return 10
                } else {
                    return player[this.layer].points.add(1)
                }
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }
        },
        12: {
            title: "want automation?",
            description: "autobuy S upgrades",
            cost: new Decimal (3),
            unlocked() {
                if (hasUpgrade('m', 11)) {
                    return true
                } else {
                    return false
                }
            }
        },
        13: {
            title: "true automation",
            description: "gain 100% of S gain on reset!",
            cost: new Decimal (10),
            unlocked() {
                if (hasUpgrade('m', 12)) {
                    return true
                } else {
                    return false
                }
            }
        },
    }
})
addLayer("b", { // boosters
    name: "boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#047562",
    requires: new Decimal(20), // Can be a function that takes requirement increases into account
    resource: "booster", // Name of prestige currency
    baseResource: "point boosts", // Name of resource prestige is based on
    baseAmount() {return player.m.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.7, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (player.tfl.points.gte(1)) mult = mult.times(tmp.tfl.effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for boosters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (player.m.points.gte(50)) {
            return true
        } else {
            if (player[this.layer].total.gte(1)) {
                return true
            } else {
                return false
            }
        } 
    },
    branches: 'm',
    effect() {
        eff = player[this.layer].points.mul(2).pow(1)
    },
    effectDescription() {
        return "multiplying point boosts gain by " + format(tmp[this.layer].effect)
    },
    upgrades: {
        11: {
            title: "boos11",
            description: ""
        }
    }
})
addLayer("a", { // QoL points
    name: "QoL points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "QoL", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: true
    }},
    color: "#FF0A0A",
    requires: new Decimal(50), // Can be a function that takes requirement increases into account
    resource: "QoL points", // Name of prestige currency
    baseResource: "point boosts", // Name of resource prestige is based on
    baseAmount() {return player.m.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.78, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (player.tfl.points.gte(4)) mult = mult.times(tmp.tfl.effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal (1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "q", description: "Q: Reset for QoL points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (player.m.points.gte(50)) {
            return true
        } else {
            if (player[this.layer].total.gte(1)) {
                return true
            } else {
                return false
            }
        } 
    },
    branches: 'm',
    milestones: {
        11: {
            effectDescription: "Keep prestige point upgrades.",
            requirementDescription: "7 total QoL points",
            done() {
                if (player.a.total.gte(7)) {
                    return true
                } else {
                    return false
                }
            }
        },
        12: {
            effectDescription: "Remove the bonus buyable, but use a formula to mirror its effects (10 ^(log10 (prestige points)/ 4 )* 10).",
            requirementDescription: "12 total QoL points",
            done() {
                if (player.a.total.gte(12)) {
                    return true
                } else {
                    return false
                }
            }
        },
    },
    effect() {
        eff = new Decimal (1)
        eff = eff.mul(player[this.layer].points).mul(3.3).add(1)
        eff = softcap(eff, new Decimal (33), 0.66)
        if(eff.gte(68)) eff = 99
        return eff
    },
    effectDescription() {
        return "multiplying points by " + format(tmp[this.layer].effect) + ". 12 QoL milestone is " + format(new Decimal (10).pow(Decimal.log10(player.p.points).div(4)).mul(10)) + "x"
    }
})
addLayer("tfl", { // thefinallayer? points
    name: "thefinallayer? points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Tb", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FF0A0A",
    requires: new Decimal(6), // Can be a function that takes requirement increases into account
    resource: "thefinallayer? points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal (1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "T: Reset for thefinallayer? points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        if (player.b.points.gte(1) && player.a.points.gte(1)) {
            return true
        } else {
            if (player[this.layer].total.gte(1)) {
                return true
            } else {
                return false
            }
        } 
    },
    branches: 'a, b',
    effect() {
        if (player.tfl.points.times(2).add(1).gte(1)) {
            if (player.tfl.points.times(2).add(1).gte(16)) {
                return 16
            } else {
                return player.tfl.points.times(2).add(1)
            }
        } else {
            return 1
        }
    },
    effectDescription() {
        return "multiplying gain of everything below this layer by " + format(tmp[this.layer].effect)
    }
})