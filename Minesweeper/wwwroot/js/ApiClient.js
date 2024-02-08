class ApiClient {
    #initializationPath = "/initialization";
    #checkCell = "/checkCell";
    constructor(fieldSize, mineNumber) {
        this.fieldSize = fieldSize;
        this.mineNumber = mineNumber;
    }

    startGame() {
        let model = {
            timestamp: new Date().toISOString(),
            fieldSize: this.fieldSize,
            mineNumber: this.mineNumber
        };

        this.sendRequest(this.#initializationPath, model);
    }

    checkCell(cellCoordinates, callback) {
        return this.sendRequest(this.#checkCell, cellCoordinates, callback);
    }

    sendRequest(path, model, callback) {
        fetch(`${path}`, {
            method: 'POST',
            body: JSON.stringify(model),
            headers: {
                'Accept': 'application/json; charset=utf-8',
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.empty !== true) {     
                let response = JSON.parse(data.response);

                let result = {
                    cells: response.Cells,
                    isGameOver: response.IsGameOver,
                    isExplosion: response.IsExplosion,
                    time: response.time
                };

                if (typeof callback === 'function') {
                    callback(result);
                }

                return result;
            } else {
                return null;
            }
        });
    }
}

