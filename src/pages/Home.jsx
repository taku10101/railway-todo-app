import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { Header } from "../components/Header";
import { url } from "../const";
import "../styles/home.scss";

export const Home = () => {
    const [isDoneDisplay, setIsDoneDisplay] = useState("todo"); // todo->未完了 done->完了
    const [lists, setLists] = useState([]);
    const [selectListId, setSelectListId] = useState();
    const [tasks, setTasks] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [cookies] = useCookies();
    const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);
    useEffect(() => {
        axios
            .get(`${url}/lists`, {
                headers: {
                    authorization: `Bearer ${cookies.token}`,
                },
            })
            .then((res) => {
                setLists(res.data);
            })
            .catch((err) => {
                setErrorMessage(`リストの取得に失敗しました。${err}`);
            });
    }, []);

    useEffect(() => {
        const listId = lists[0]?.id;
        if (typeof listId !== "undefined") {
            setSelectListId(listId);
            axios
                .get(`${url}/lists/${listId}/tasks`, {
                    headers: {
                        authorization: `Bearer ${cookies.token}`,
                    },
                })
                .then((res) => {
                    setTasks(res.data.tasks);
                })
                .catch((err) => {
                    setErrorMessage(`タスクの取得に失敗しました。${err}`);
                });
        }
    }, [lists]);

    const handleSelectList = (id) => {
        setSelectListId(id);
        axios
            .get(`${url}/lists/${id}/tasks`, {
                headers: {
                    authorization: `Bearer ${cookies.token}`,
                },
            })
            .then((res) => {
                setTasks(res.data.tasks);
            })
            .catch((err) => {
                setErrorMessage(`タスクの取得に失敗しました。${err}`);
            });
    };
    const keyMove = (e) => {
        if (e.key === "ArrowUp") {
            const moveIndex = lists.findIndex((list) => list.id === selectListId); // 選択中のリストのインデックスを取得
            const previousIndex = (moveIndex - 1 + lists.length) % lists.length; // 選択中のリストの一つ前のインデックスを取得 %でリストの数を超えないようにする
            const previousId = lists[previousIndex].id; // 選択中のリストの一つ前のリストのIDを取得
            console.log(lists[previousIndex]);
            handleSelectList(previousId);
        } else if (e.key === "ArrowDown") {
            const moveIndex = lists.findIndex((list) => list.id === selectListId);
            const nextIndex = (moveIndex + 1) % lists.length;
            const nextId = lists[nextIndex].id;
            handleSelectList(nextId);
        }
    };
    return (
        <div>
            <Header />
            <main className="taskList">
                <p className="error-message">{errorMessage}</p>
                <div>
                    <div className="list-header">
                        <h2>リスト一覧</h2>
                        <div className="list-menu">
                            <p>
                                <Link to="/list/new">リスト新規作成</Link>
                            </p>
                            <p>
                                <Link to={`/lists/${selectListId}/edit`}>選択中のリストを編集</Link>
                            </p>
                        </div>
                    </div>
                    <ul className="list-tab">
                        {lists.map((list, key) => {
                            const isActive = list.id === selectListId;
                            return (
                                <li
                                    onKeyDown={keyMove}
                                    tabIndex={0}
                                    key={key}
                                    className={`list-tab-item ${isActive ? "active" : ""}`}
                                    onClick={() => handleSelectList(list.id)}
                                >
                                    {list.title}
                                </li>
                            );
                        })}
                    </ul>
                    <div className="tasks">
                        <div className="tasks-header">
                            <h2>タスク一覧</h2>
                            <Link to="/task/new">タスク新規作成</Link>
                        </div>
                        <div className="display-select-wrapper">
                            <select onChange={handleIsDoneDisplayChange} className="display-select">
                                <option value="todo">未完了</option>
                                <option value="done">完了</option>
                            </select>
                        </div>
                        <Tasks tasks={tasks} selectListId={selectListId} isDoneDisplay={isDoneDisplay} />
                    </div>
                </div>
            </main>
        </div>
    );
};

// 表示するタスク
// 表示するタスク
const Tasks = (props) => {
    // eslint-disable-next-line
    const tasks = props.tasks;
    // eslint-disable-next-line
    const selectListId = props.selectListId;
    // eslint-disable-next-line
    const isDoneDisplay = props.isDoneDisplay;
    const isDone = isDoneDisplay === "done";
    if (tasks === null) return <></>;

    return (
        <ul>
            {tasks
                // eslint-disable-next-line
                .filter((task) => {
                    return task.done === isDone;
                })
                .map((task, key) => {
                    const date = new Date(task.limit);
                    const pad = function (str) {
                        return ("0" + str).slice(-2);
                    };
                    // 表示用
                    const year = date.getFullYear().toString();
                    const month = pad((date.getMonth() + 1).toString());
                    const day = pad(date.getDate().toString());
                    const hour = pad(date.getHours().toString());
                    const min = pad(date.getMinutes().toString());
                    const text = `${year}年${month}月${day}日 ${hour}:${min}`;

                    // 現在時刻を取得
                    const currentDate = new Date();

                    // 差分を取得

                    const timeDiff = Math.ceil((date - currentDate) / (1000 * 60));
                    const resDiff = timeDiff < 0 ? -timeDiff : timeDiff;

                    // 残りの日数、時間、分を計算
                    const daysDiff = Math.floor(resDiff / (60 * 24));
                    const hoursDiff = Math.floor((resDiff % (60 * 24)) / 60);
                    const minDiff = Math.floor(resDiff % 60);

                    // 残り時間のテキストを格納
                    const textLimit =
                        timeDiff >= 0
                            ? `残り${daysDiff}日${hoursDiff}時間${minDiff}分`
                            : `${Math.abs(daysDiff)}日${Math.abs(hoursDiff)}時間${Math.abs(minDiff)}分 遅れ`;

                    return (
                        <li key={key} className="task-item">
                            <Link to={`/lists/${selectListId}/tasks/${task.id}`} className="task-item-link">
                                <div className="task-item-link-left">
                                    <span>{task.title}</span>
                                </div>
                                <span className="vertical">{task.done ? "完了" : "未完了"}</span>
                                <div className="task-item-link-right">
                                    <span>{text}</span>
                                    {task.done ? (
                                        ""
                                    ) : (
                                        <span style={{ color: timeDiff >= 0 ? "initial" : "red" }}>{textLimit}</span>
                                    )}
                                </div>
                            </Link>
                        </li>
                    );
                })}
        </ul>
    );
};
