// socket.io events - their names are predefined
export const EVENT_CONNECT = "connect";
export const EVENT_DISCONNECT = "disconnect";
// game events - their names can be anything
// as long as the server and client match up
export const EVENT_SELF_IDENTIFY = "user/self-identify";
export const EVENT_FITWICK_NEW = "fitwick/new";
export const EVENT_FITWICK_PLACE = "fitwick/place";
export const EVENT_FITWICK_DELETE = "fitwick/delete";
export const EVENT_FITWICK_MOVE = "fitwick/move";
export const EVENT_FITWICK_TAP = "fitwick/tap";
export const EVENT_MUSIC_CHANGE = "music/change";
export const EVENT_MUSIC_PLAY = "music/play";
export const EVENT_MUSIC_PAUSE = "music/pause";
export const EVENT_VOLUME_CHANGE = "volume/change";
export const EVENT_EXIT_WORLD = "world/exit";
export const EVENT_NAVIGATE_HOME = "world/exit-and-nav-home";
