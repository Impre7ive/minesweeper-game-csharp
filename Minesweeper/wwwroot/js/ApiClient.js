class ApiClient {
    #initializationPath = "/initialization";
    #checkCell = "/checkCell";
    constructor(fieldSize, mineNumber) {
        this.fieldSize = fieldSize;
        this.mineNumber = mineNumber;
    }

    startGame() {
        let model = {
            timestamp: new Date().toUTCString(),
            fieldSize: this.fieldSize,
            mineNumber: this.mineNumber
        };

        this.sendRequest(this.#initializationPath, model);
    }

    checkCell(cellCoordinates) {//cell determines {x, y}
        this.sendRequest(this.#checkCell, cellCoordinates);
    }

    sendRequest(path, model) {
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
            if (data.success) {
                let result = {
                    cells: data.cells,
                    isGameOver: data.isGameOver,
                    isExplosion: data.isExplosion
                };

                return result;
            } else {
                alert("Something went wrong!");
                return null;
            }
        });
    }
}

let api = new ApiClient(2, 2);
api.startGame();