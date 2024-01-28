import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import axios from "axios";
import { useCookies } from "react-cookie";
import { url } from "../const";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/editTask.scss";

export const EditTask = () => {
    const navigation = useNavigate();
    const { listId, taskId } = useParams();
    const [cookies] = useCookies();
    const [title, setTitle] = useState("");
    const [detail, setDetail] = useState("");
    const [isDone, setIsDone] = useState();
    const [limit, setLimit] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const handleTitleChange = (e) => setTitle(e.target.value);
    const handleDetailChange = (e) => setDetail(e.target.value);
    const handleIsDoneChange = (e) => setIsDone(e.target.value === "done");
    const handleLimitChange = (e) => setLimit(e.target.value);

    const onUpdateTask = (e) => {
        e.preventDefault();

        const strLimit = limit !== "" ? new Date(limit).toISOString() : "";
        const data = {
            title: title,
            detail: detail,
            done: isDone,
            limit: strLimit,
        };

        axios
            .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
                headers: {
                    authorization: `Bearer ${cookies.token}`,
                },
            })
            .then((res) => {
                console.log(res);
                navigation("/");
            })
            .catch((err) => {
                setErrorMessage(`更新に失敗しました。${err}`);
            });
    };

    const onDeleteTask = () => {
        axios
            .delete(`${url}/lists/${listId}/tasks/${taskId}`, {
                headers: {
                    authorization: `Bearer ${cookies.token}`,
                },
            })
            .then(() => {
                navigation("/");
            })
            .catch((err) => {
                setErrorMessage(`削除に失敗しました。${err}`);
            });
    };

    useEffect(() => {
        axios
            .get(`${url}/lists/${listId}/tasks/${taskId}`, {
                headers: {
                    authorization: `Bearer ${cookies.token}`,
                },
            })
            .then((res) => {
                const task = res.data;
                setTitle(task.title);
                setDetail(task.detail);
                setIsDone(task.done);
                const date = new Date(task.limit);
                const str = toISOStringWithTimezone(date);
                setLimit(str.substring(0, 16));
            })
            .catch((err) => {
                setErrorMessage(`タスク情報の取得に失敗しました。${err}`);
            });
    }, []);

    // JSTのISO 8601表現にする関数（引数: date: Date型）
    function toISOStringWithTimezone(date) {
        const pad = function (str) {
            return ("0" + str).slice(-2);
        };
        const year = date.getFullYear().toString();
        const month = pad((date.getMonth() + 1).toString());
        const day = pad(date.getDate().toString());
        const hour = pad(date.getHours().toString());
        const min = pad(date.getMinutes().toString());
        const sec = pad(date.getSeconds().toString());
        const tz = -date.getTimezoneOffset();
        const sign = tz >= 0 ? "+" : "-";
        const tzHour = pad((tz / 60).toString());
        const tzMin = pad((tz % 60).toString());

        return `${year}-${month}-${day}T${hour}:${min}:${sec}${sign}${tzHour}:${tzMin}`;
    }

    return (
        <div>
            <Header />
            <main className="edit-task">
                <h2>タスク編集</h2>
                <p className="error-message">{errorMessage}</p>
                <form className="edit-task-form" onSubmit={onUpdateTask}>
                    <label>タイトル</label>
                    <br />
                    <input type="text" onChange={handleTitleChange} className="edit-task-title" value={title} />
                    <br />
                    <label>詳細</label>
                    <br />
                    <textarea type="text" onChange={handleDetailChange} className="edit-task-detail" value={detail} />
                    <br />
                    <div>
                        <input
                            type="radio"
                            id="todo"
                            name="status"
                            value="todo"
                            onChange={handleIsDoneChange}
                            checked={isDone === false ? "checked" : ""}
                        />
                        未完了
                        <input
                            type="radio"
                            id="done"
                            name="status"
                            value="done"
                            onChange={handleIsDoneChange}
                            checked={isDone === true ? "checked" : ""}
                        />
                        完了
                    </div>
                    <br />
                    <div>
                        <label>期限</label>
                        <br />
                        <input type={"datetime-local"} value={limit} onChange={handleLimitChange} />
                    </div>
                    <button type="button" className="delete-task-button" onClick={onDeleteTask}>
                        削除
                    </button>
                    <button type="submit" className="edit-task-button">
                        更新
                    </button>
                </form>
            </main>
        </div>
    );
};
