import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { SQUARE } from "./constants/index";

function Square(props) {
    return (
        <button className="square" style={props.style} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    renderWinnerSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                style={{ backgroundColor: "red" }}
            />
        );
    }

    createTable = () => {
        let table = [];
        for (let i = 0; i < SQUARE; i++) {
            let child = [];
            for (let j = 0; j < SQUARE; j++) {
                if (this.props.listWin.includes(i * SQUARE + j)) {
                    child.push(this.renderWinnerSquare(i * SQUARE + j));
                } else {
                    child.push(this.renderSquare(i * SQUARE + j));
                }
            }
            table.push(<div className="board-row">{child}</div>);
        }
        return table;
    };

    render() {
        return <div>{this.createTable()}</div>;
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(SQUARE * SQUARE).fill(null),
                    xIsNext: true,
                    location: null,
                },
            ],
            isAscending: true,
            xIsNext: true,
            stepNumber: 0,
            isFinish: false,
            listWin: Array(5).fill(null),
            isDraw: false,
        };
    }
    jumpTo(step) {
        if (step === 0) {
            this.setState({
                history: [
                    {
                        squares: Array(SQUARE * SQUARE).fill(null),
                        xIsNext: true,
                        location: null,
                    },
                ],
                xIsNext: true,
                stepNumber: 0,
                isFinish: false,
                listWin: Array(5).fill(null),
                isWin: false,
            });
        } else {
            this.setState({
                stepNumber: step,
                xIsNext: step % 2 === 0,
                listWin: Array(5).fill(null),
                isWin: false,
            });
        }
    }

    handleClickAscending = () => {
        const { isAscending } = this.state;
        this.setState({ isAscending: !isAscending });
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const { isFinish, xIsNext } = this.state;
        if (isFinish || squares[i]) {
            return;
        }
        squares[i] = xIsNext ? "X" : "O";
        const objWinner = calculateWinner(squares, i, xIsNext);
        if (objWinner !== undefined && objWinner.isdraw) {
            this.setState({
                history: history.concat([
                    {
                        squares: squares,
                        xIsNext: xIsNext,
                        location: i,
                    },
                ]),
                stepNumber: history.length,
                isFinish: true,
                isDraw: true,
            });
        } else {
            if (objWinner !== undefined && objWinner.isWin) {
                this.setState({
                    history: history.concat([
                        {
                            squares: squares,
                            xIsNext: xIsNext,
                            location: i,
                        },
                    ]),
                    stepNumber: history.length,
                    isFinish: true,
                    listWin: objWinner.listWin,
                });
            } else {
                this.setState({
                    history: history.concat([
                        {
                            squares: squares,
                            xIsNext: xIsNext,
                            location: i,
                        },
                    ]),
                    xIsNext: !xIsNext,
                    stepNumber: history.length,
                });
            }
        }
    }
    render() {
        const {
            history,
            isFinish,
            isDraw,
            stepNumber,
            xIsNext,
            listWin,
            isAscending
        } = this.state;
        const current = history[stepNumber];
        const moves = history.map((step, move) => {
            const desc = move
                ? `Go to move #${move} player ${
                      step.xIsNext ? "X" : "O"
                  } (${Math.floor(step.location / SQUARE)}, ${
                      step.location % SQUARE
                  })`
                : "Go to game start";
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{stepNumber === move ? <b>{desc}</b> : desc}</button>
                </li>
            );
        });

        const sortingMoves = isAscending ? moves : moves.reverse();

        let status;
        if (isDraw) {
            status = "Draw!!!";
        } else {
            if (isFinish) {
                status = "Winner: " + (xIsNext ? "X" : "O");
            } else {
                status = "Next player: " + (xIsNext ? "X" : "O");
            }
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        listWin={listWin}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button className="sort" onClick={this.handleClickAscending}>
                        {isAscending ? "Ascending" : "Descending"}
                    </button>
                    <ol>{sortingMoves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function checkValid(y, x) {
    return x > -1 && x < SQUARE && y > -1 && y < SQUARE;
}

function calculateWinner(squares, index, xIsNext) {
    let curState;

    let listResult = [index];
    if (xIsNext) {
        curState = "X";
    } else {
        curState = "O";
    }

    let x = index % SQUARE,
        y = Math.floor(index / SQUARE);
    // dọc
    let count1, count2;
    count1 = 1;
    count2 = 0;
    for (let i = 1; i < 7; i++) {
        if (checkValid(y - i, x)) {
            if (squares[(y - i) * SQUARE + x] === curState) {
                count1++;
                listResult.push((y - i) * SQUARE + x);
            } else {
                if (
                    squares[(y - i) * SQUARE + x] !== curState &&
                    squares[(y - i) * SQUARE + x] !== null
                ) {
                    count2++;
                    listResult.push((y - i) * SQUARE + x);
                }
                break;
            }
        }
    }

    for (let i = 1; i < 7; i++) {
        if (checkValid(y + i, x)) {
            if (squares[(y + i) * SQUARE + x] === curState) {
                count1++;
                listResult.push((y + i) * SQUARE + x);
            } else {
                if (
                    squares[(y + i) * SQUARE + x] !== curState &&
                    squares[(y + i) * SQUARE + x] !== null
                ) {
                    count2++;
                    listResult.push((y + i) * SQUARE + x);
                }
                break;
            }
        }
    }

    if (count1 === 5 && count2 < 2) {
        return {
            isWin: true,
            listWin: listResult,
        };
    } else {
        listResult = [index];
    }

    // ngang
    count1 = 1;
    count2 = 0;

    for (let i = 1; i < 7; i++) {
        if (checkValid(y, x - i)) {
            if (squares[y * SQUARE + (x - i)] === curState) {
                count1++;
                listResult.push(y * SQUARE + (x - i));
            } else {
                if (
                    squares[y * SQUARE + (x - i)] !== curState &&
                    squares[y * SQUARE + (x - i)] !== null
                ) {
                    count2++;
                    listResult.push(y * SQUARE + (x - i));
                }
                break;
            }
        }
    }

    for (let i = 1; i < 7; i++) {
        if (checkValid(y, x + i)) {
            if (squares[y * SQUARE + (x + i)] === curState) {
                count1++;
                listResult.push(y * SQUARE + (x + i));
            } else {
                if (
                    squares[y * SQUARE + (x + i)] !== curState &&
                    squares[y * SQUARE + (x + i)] !== null
                ) {
                    count2++;
                    listResult.push(y * SQUARE + (x + i));
                }
                break;
            }
        }
    }

    if (count1 === 5 && count2 < 2) {
        return {
            isWin: true,
            listWin: listResult,
        };
    } else {
        listResult = [index];
    }

    // chéo \

    count1 = 1;
    count2 = 0;

    for (let i = 1; i < 7; i++) {
        if (checkValid(y - i, x - i)) {
            if (squares[(y - i) * SQUARE + (x - i)] === curState) {
                count1++;
                listResult.push((y - i) * SQUARE + (x - i));
            } else {
                if (
                    squares[(y - i) * SQUARE + (x - i)] !== curState &&
                    squares[(y - i) * SQUARE + (x - i)] !== null
                ) {
                    count2++;
                    listResult.push((y - i) * SQUARE + (x - i));
                }
                break;
            }
        }
    }

    for (let i = 1; i < 7; i++) {
        if (checkValid(y + i, x + i)) {
            if (squares[(y + i) * SQUARE + (x + i)] === curState) {
                count1++;
                listResult.push((y + i) * SQUARE + (x + i));
            } else {
                if (
                    squares[(y + i) * SQUARE + (x + i)] !== curState &&
                    squares[(y + i) * SQUARE + (x + i)] !== null
                ) {
                    count2++;
                    listResult.push((y + i) * SQUARE + (x + i));
                }
                break;
            }
        }
    }

    if (count1 === 5 && count2 < 2) {
        return {
            isWin: true,
            listWin: listResult,
        };
    } else {
        listResult = [index];
    }

    // chéo /

    count1 = 1;
    count2 = 0;

    for (let i = 1; i < 7; i++) {
        if (checkValid(y - i, x + i)) {
            if (squares[(y - i) * SQUARE + (x + i)] === curState) {
                count1++;
                listResult.push((y - i) * SQUARE + (x + i));
            } else {
                if (
                    squares[(y - i) * SQUARE + (x + i)] !== curState &&
                    squares[(y - i) * SQUARE + (x + i)] !== null
                ) {
                    count2++;
                    listResult.push((y - i) * SQUARE + (x + i));
                }
                break;
            }
        }
    }

    for (let i = 1; i < 7; i++) {
        if (checkValid(y + i, x - i)) {
            if (squares[(y + i) * SQUARE + (x - i)] === curState) {
                count1++;
                listResult.push((y + i) * SQUARE + (x - i));
            } else {
                if (
                    squares[(y + i) * SQUARE + (x - i)] !== curState &&
                    squares[(y + i) * SQUARE + (x - i)] !== null
                ) {
                    count2++;
                    listResult.push((y + i) * SQUARE + (x - i));
                }
                break;
            }
        }
    }

    if (count1 === 5 && count2 < 2) {
        return {
            isWin: true,
            listWin: listResult,
        };
    }

    if (!squares.includes(null)) {
        return {
            isDraw: true,
        };
    }
}
