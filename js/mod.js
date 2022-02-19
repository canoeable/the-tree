let modInfo = {
	name: "The Booping Tree",
	id: "nothere.e",
	author: "theepichub",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.0.00",
	name: "Literally nothing",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>vA.B.CD</h3><br>
	A- Bigger content patches (eg adding a new layer)<br>
	B- Smaller content patches (eg New Upgrades/Buyables/Milestones)<br>
	C- Crucial bug fix (eg NaN bug)<br>
	D- Less important bug fix (eg wording messed up or fixing formulas)<br>
	<br>
	<h3>v1.0.00</h3><br>
		- Game got made.<br>`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	if (hasUpgrade('p', 11)) gain = gain.times(upgradeEffect('p', 11))
	if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12))
	if (hasUpgrade('p', 14)) gain = gain.times(upgradeEffect('p', 14))
	if (player.m.points.gte(1)) gain = gain.pow(tmp.m.effect)
	if (player.tfl.points.gte(1)) gain = gain.times(tmp.tfl.effect)
	if (player.c.points.gte(1)) gain = gain.times(new Decimal (25))
	gain = gain.times(buyableEffect('p', 11))
	gain = gain.times(tmp.a.effect)
	if (hasMilestone('a', 12)&&player.p.points.gte(1)) gain = gain.times(new Decimal (10).pow(Decimal.log10(player.p.points).div(4)).mul(10))
	gain = gain.times(player.per.pointmul)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}

// Dev commands here!

var dev = {};

dev.getDevSave = function(x) {
	if (x==0) {
	player.p.upgrades = [];
	player.m.upgrades = [];
	player.per.upgrades = [];
	setBuyableAmount('p', 11, new Decimal (0))
	player.a.milestones = [];
	player.ach.achievements = [];
	return "DEV - Reset all upgrades, buyables, achievements and milestones" 
	}
	if (x==1) {
	player.points = new Decimal (10)
	player.p.points = new Decimal (0)
	player.m.points = new Decimal (0)
	player.per.points = new Decimal (0)
	player.c.points = new Decimal (0)
	player.b.points = new Decimal (0)
	player.a.points = new Decimal (0)
	player.tfl.points = new Decimal (0)
	player.p.total = new Decimal (0)
	player.m.total = new Decimal (0)
	player.per.total = new Decimal (0)
	player.c.total = new Decimal (0)
	player.b.total = new Decimal (0)
	player.a.total = new Decimal (0)
	player.tfl.points = new Decimal (0)
	return "DEV - Set most currency to 0 + set points to 10."
	}
	if (x==2) {
	player.points = new Decimal (1e9)
	player.p.points = new Decimal (3500000)
	player.p.upgrades = ['11', '12', '13', '14', '15', '21'];
	return "DEV - Finished p layer."
	}
	if (x==3) {
	player.points = new Decimal (1e9)
	player.p.points = new Decimal (3500000)
	player.m.points = new Decimal (50)
	player.p.upgrades = ['11', '12', '13', '14', '15', '21'];
	player.m.upgrades = ['11', '12', '13'];
	return "DEV - Finished P layer and PB layer."
	}
}

dev.mulPoints = function(x) {
	player.points = player.points.mul(x)
}