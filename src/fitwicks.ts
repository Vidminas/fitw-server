export enum FitwickTheme {
  WINTER,
  TOOLS,
  COOKING,
  ELECTRONICS,
  DESERT,
  TREES,
}

// a map of [fitwick name, fitwick themes] pairs
// it helps to keep track of user stats
export const FITWICKS = new Map<string, FitwickTheme[]>();
FITWICKS.set("tree", [FitwickTheme.TREES]);
FITWICKS.set("dead tree", [FitwickTheme.TREES]);
FITWICKS.set("pine tree", [FitwickTheme.TREES]);

FITWICKS.set("snowy tree", [FitwickTheme.TREES, FitwickTheme.WINTER]);
FITWICKS.set("snowman", [FitwickTheme.WINTER]);
FITWICKS.set("crystal", [FitwickTheme.WINTER]);
FITWICKS.set("block of ice", [FitwickTheme.WINTER]);
FITWICKS.set("igloo", [FitwickTheme.WINTER]);

FITWICKS.set("palm tree", [FitwickTheme.TREES, FitwickTheme.DESERT]);
FITWICKS.set("baobab", [FitwickTheme.TREES, FitwickTheme.DESERT]);
FITWICKS.set("cactus", [FitwickTheme.DESERT]);
FITWICKS.set("desert building", [FitwickTheme.DESERT]);
FITWICKS.set("small pyramid", [FitwickTheme.DESERT]);
FITWICKS.set("skull", [FitwickTheme.DESERT]);

FITWICKS.set("drill", [FitwickTheme.TOOLS]);
FITWICKS.set("sander", [FitwickTheme.TOOLS]);
FITWICKS.set("wrench", [FitwickTheme.TOOLS]);
FITWICKS.set("spanner", [FitwickTheme.TOOLS]);
FITWICKS.set("screwdriver", [FitwickTheme.TOOLS]);
FITWICKS.set("monkey wrench", [FitwickTheme.TOOLS]);
FITWICKS.set("pliers", [FitwickTheme.TOOLS]);
FITWICKS.set("hammer", [FitwickTheme.TOOLS]);
FITWICKS.set("brush", [FitwickTheme.TOOLS]);
FITWICKS.set("tape measure", [FitwickTheme.TOOLS]);
FITWICKS.set("box knife", [FitwickTheme.TOOLS]);
FITWICKS.set("paint roller", [FitwickTheme.TOOLS]);
FITWICKS.set("chisel", [FitwickTheme.TOOLS]);
FITWICKS.set("saw", [FitwickTheme.TOOLS]);
FITWICKS.set("screw", [FitwickTheme.TOOLS]);
FITWICKS.set("nail", [FitwickTheme.TOOLS]);
FITWICKS.set("axe", [FitwickTheme.TOOLS]);
FITWICKS.set("pickaxe", [FitwickTheme.TOOLS]);
FITWICKS.set("shovel", [FitwickTheme.TOOLS]);
FITWICKS.set("mallet", [FitwickTheme.TOOLS]);

FITWICKS.set("pot", [FitwickTheme.COOKING]);
FITWICKS.set("pan", [FitwickTheme.COOKING]);
FITWICKS.set("salt shaker", [FitwickTheme.COOKING]);
FITWICKS.set("pepper shaker", [FitwickTheme.COOKING]);
FITWICKS.set("kettle", [FitwickTheme.COOKING]);
FITWICKS.set("fork", [FitwickTheme.COOKING]);
FITWICKS.set("spoon", [FitwickTheme.COOKING]);
FITWICKS.set("knife", [FitwickTheme.COOKING]);
FITWICKS.set("oven glove", [FitwickTheme.COOKING]);
FITWICKS.set("cutting board", [FitwickTheme.COOKING]);
FITWICKS.set("spatula", [FitwickTheme.COOKING]);
FITWICKS.set("tongs", [FitwickTheme.COOKING]);
FITWICKS.set("blender", [FitwickTheme.COOKING]);
FITWICKS.set("toaster", [FitwickTheme.COOKING]);
FITWICKS.set("coffee machine", [FitwickTheme.COOKING]);
FITWICKS.set("rolling pin", [FitwickTheme.COOKING]);

FITWICKS.set("monitor", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("computer", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("keyboard", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("mouse", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("tablet", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("remote", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("mobile phone", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("music player", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("USB", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("calculator", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("motherboard", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("RAM", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("graphics card", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("joystick", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("controller", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("microphone", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("headphones", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("CD", [FitwickTheme.ELECTRONICS]);
FITWICKS.set("cursor", [FitwickTheme.ELECTRONICS]);
