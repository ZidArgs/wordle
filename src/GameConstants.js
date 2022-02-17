class GameConstants {

    get acceptedChars() {
        return "abcdefghijklmnopqrstuvwxyz";
    }

    get statusInProgress() {
        return "IN_PROGRESS";
    }

    get statusWin() {
        return "WIN";
    }

    get statusFail() {
        return "FAIL";
    }

}

export default new GameConstants();
