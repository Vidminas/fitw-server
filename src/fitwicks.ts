export enum FitwickTheme {
  WINTER,
  TOOLS,
  COOKING,
  ELETRONICS,
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

FITWICKS.set("monitor", [FitwickTheme.ELETRONICS]);
FITWICKS.set("computer", [FitwickTheme.ELETRONICS]);
FITWICKS.set("keyboard", [FitwickTheme.ELETRONICS]);
FITWICKS.set("mouse", [FitwickTheme.ELETRONICS]);
FITWICKS.set("tablet", [FitwickTheme.ELETRONICS]);
FITWICKS.set("remote", [FitwickTheme.ELETRONICS]);
FITWICKS.set("mobile phone", [FitwickTheme.ELETRONICS]);
FITWICKS.set("music player", [FitwickTheme.ELETRONICS]);
FITWICKS.set("USB", [FitwickTheme.ELETRONICS]);
FITWICKS.set("calculator", [FitwickTheme.ELETRONICS]);
FITWICKS.set("motherboard", [FitwickTheme.ELETRONICS]);
FITWICKS.set("RAM", [FitwickTheme.ELETRONICS]);
FITWICKS.set("graphics card", [FitwickTheme.ELETRONICS]);
FITWICKS.set("joystick", [FitwickTheme.ELETRONICS]);
FITWICKS.set("controller", [FitwickTheme.ELETRONICS]);
FITWICKS.set("microphone", [FitwickTheme.ELETRONICS]);
FITWICKS.set("headphones", [FitwickTheme.ELETRONICS]);
FITWICKS.set("CD", [FitwickTheme.ELETRONICS]);
FITWICKS.set("cursor", [FitwickTheme.ELETRONICS]);
