import React, {useState, useEffect} from 'react';
import './App.css';
import ToDoForm from './AddTask';
import ToDo from './Task';
import axios from 'axios';

const TASKS_STORAGE_KEY = 'tasks-list-project-web';

function App() {
    const [rates, setRates] = useState({});
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [todos, setTodos] = useState([]);
    const [ipData, setIpData] = useState(null);

    useEffect(() => {
        async function fetchAllData() {
            try {
                // Курсы валют (USD, EUR, CNY) к RUB
                const [usd, eur, cny] = await Promise.all([
                    axios.get('https://v6.exchangerate-api.com/v6/3ee38075a1e840e9ef7b3a24/latest/USD'),
                    axios.get('https://v6.exchangerate-api.com/v6/3ee38075a1e840e9ef7b3a24/latest/EUR'),
                    axios.get('https://v6.exchangerate-api.com/v6/3ee38075a1e840e9ef7b3a24/latest/CNY'),
                ]);

                const ipResponse = await axios.get('https://ipconfig.io/json');
                setIpData(ipResponse.data);

                const USDrate = usd.data.conversion_rates.RUB.toFixed(2).replace('.', ',');
                const EURrate = eur.data.conversion_rates.RUB.toFixed(2).replace('.', ',');
                const CNYrate = cny.data.conversion_rates.RUB.toFixed(2).replace('.', ',');

                setRates({USDrate, EURrate, CNYrate});

                // Получаем координаты устройства
                navigator.geolocation.getCurrentPosition(async position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    const weatherResponse = await axios.get(
                        `https://api.weather.yandex.ru/v2/forecast?lat=${lat}&lon=${lon}&lang=ru_RU`,
                        {
                            headers: {
                                'X-Yandex-Weather-Key': '5254d49c-4ca4-44f5-b90e-c3a9c6cd038f'
                            }
                        }
                    );

                    setWeatherData(weatherResponse.data);
                }, error => {
                    console.error('Ошибка получения геолокации:', error);
                    setError('Не удалось получить координаты устройства.');
                });
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
                setError('Ошибка загрузки данных.');
            } finally {
                setLoading(false);
            }
        }

        fetchAllData();
    }, []);

    useEffect(() => {
        const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
        if (storedTasks) {
            const parsed = JSON.parse(storedTasks);
            if (Array.isArray(parsed)) setTodos(parsed);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
    }, [todos]);

    const addTask = (userInput) => {
        if (userInput) {
            const newItem = {
                id: Math.random().toString(36).substr(2, 9),
                task: userInput,
                complete: false
            };
            setTodos([...todos, newItem]);
        }
    };

    const removeTask = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const handleToggle = (id) => {
        setTodos(todos.map(task =>
            task.id === id ? {...task, complete: !task.complete} : task
        ));
    };

    return (
        <>
            <div className="App">
                {loading && <p>Загрузка...</p>}
                {!loading && error && <p style={{color: 'red'}}>{error}</p>}
                {!loading && !error && (
                    <>
                        {/* Курс валют */}
                        <div className="container">
                            <div className="header-container">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none">
                                    <path opacity="0.2"
                                          d="M21 5.25V19.5H3V4.5H20.25C20.4489 4.5 20.6397 4.57902 20.7803 4.71967C20.921 4.86032 21 5.05109 21 5.25Z"
                                          fill="#E9E9E9"/>
                                    <path
                                        d="M21.75 19.5C21.75 19.6989 21.671 19.8897 21.5303 20.0303C21.3897 20.171 21.1989 20.25 21 20.25H3C2.80109 20.25 2.61032 20.171 2.46967 20.0303C2.32902 19.8897 2.25 19.6989 2.25 19.5V4.5C2.25 4.30109 2.32902 4.11032 2.46967 3.96967C2.61032 3.82902 2.80109 3.75 3 3.75C3.19891 3.75 3.38968 3.82902 3.53033 3.96967C3.67098 4.11032 3.75 4.30109 3.75 4.5V13.3472L8.50594 9.1875C8.63536 9.07421 8.79978 9.00885 8.97165 9.00236C9.14353 8.99587 9.31241 9.04866 9.45 9.15188L14.9634 13.2872L20.5059 8.4375C20.5786 8.36556 20.6652 8.30925 20.7605 8.27201C20.8557 8.23478 20.9575 8.21741 21.0597 8.22097C21.1619 8.22454 21.2623 8.24896 21.3547 8.29275C21.4471 8.33653 21.5296 8.39875 21.5971 8.47558C21.6645 8.5524 21.7156 8.64222 21.7471 8.7395C21.7786 8.83678 21.7899 8.93948 21.7802 9.04128C21.7706 9.14307 21.7402 9.24182 21.691 9.33146C21.6418 9.42109 21.5748 9.49972 21.4941 9.5625L15.4941 14.8125C15.3646 14.9258 15.2002 14.9912 15.0283 14.9976C14.8565 15.0041 14.6876 14.9513 14.55 14.8481L9.03656 10.7147L3.75 15.3403V18.75H21C21.1989 18.75 21.3897 18.829 21.5303 18.9697C21.671 19.1103 21.75 19.3011 21.75 19.5Z"
                                        fill="#E9E9E9"/>
                                </svg>
                                <span>Курс валют</span>
                            </div>
                            <div id="USD">USD ($): {rates.USDrate}₽</div>
                            <div id="EUR">EUR (€): {rates.EURrate}₽</div>
                            <div id="CNY">CNY (¥): {rates.CNYrate}₽</div>
                        </div>

                        {/* Список задач */}
                        <div className="container width-100">
                            <div className="header-container">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none">
                                    <path opacity="0.2" d="M20.25 6V18H12V6H20.25Z" fill="#E9E9E9"/>
                                    <path
                                        d="M21.0001 12.0004C21.0001 12.1993 20.921 12.3901 20.7804 12.5307C20.6397 12.6714 20.449 12.7504 20.2501 12.7504H12.0001C11.8011 12.7504 11.6104 12.6714 11.4697 12.5307C11.3291 12.3901 11.2501 12.1993 11.2501 12.0004C11.2501 11.8015 11.3291 11.6107 11.4697 11.4701C11.6104 11.3294 11.8011 11.2504 12.0001 11.2504H20.2501C20.449 11.2504 20.6397 11.3294 20.7804 11.4701C20.921 11.6107 21.0001 11.8015 21.0001 12.0004ZM12.0001 6.75042H20.2501C20.449 6.75042 20.6397 6.6714 20.7804 6.53075C20.921 6.39009 21.0001 6.19933 21.0001 6.00042C21.0001 5.8015 20.921 5.61074 20.7804 5.47009C20.6397 5.32943 20.449 5.25042 20.2501 5.25042H12.0001C11.8011 5.25042 11.6104 5.32943 11.4697 5.47009C11.3291 5.61074 11.2501 5.8015 11.2501 6.00042C11.2501 6.19933 11.3291 6.39009 11.4697 6.53075C11.6104 6.6714 11.8011 6.75042 12.0001 6.75042ZM20.2501 17.2504H12.0001C11.8011 17.2504 11.6104 17.3294 11.4697 17.4701C11.3291 17.6107 11.2501 17.8015 11.2501 18.0004C11.2501 18.1993 11.3291 18.3901 11.4697 18.5307C11.6104 18.6714 11.8011 18.7504 12.0001 18.7504H20.2501C20.449 18.7504 20.6397 18.6714 20.7804 18.5307C20.921 18.3901 21.0001 18.1993 21.0001 18.0004C21.0001 17.8015 20.921 17.6107 20.7804 17.4701C20.6397 17.3294 20.449 17.2504 20.2501 17.2504ZM7.71943 3.96979L5.25005 6.4401L4.28068 5.46979C4.13995 5.32906 3.94907 5.25 3.75005 5.25C3.55103 5.25 3.36016 5.32906 3.21943 5.46979C3.0787 5.61052 2.99963 5.80139 2.99963 6.00042C2.99963 6.19944 3.0787 6.39031 3.21943 6.53104L4.71943 8.03104C4.78908 8.10077 4.8718 8.15609 4.96285 8.19384C5.05389 8.23158 5.15149 8.25101 5.25005 8.25101C5.34861 8.25101 5.44621 8.23158 5.53726 8.19384C5.6283 8.15609 5.71102 8.10077 5.78068 8.03104L8.78068 5.03104C8.92141 4.89031 9.00047 4.69944 9.00047 4.50042C9.00047 4.30139 8.92141 4.11052 8.78068 3.96979C8.63995 3.82906 8.44907 3.75 8.25005 3.75C8.05103 3.75 7.86016 3.82906 7.71943 3.96979ZM7.71943 9.96979L5.25005 12.4401L4.28068 11.4698C4.13995 11.3291 3.94907 11.25 3.75005 11.25C3.55103 11.25 3.36016 11.3291 3.21943 11.4698C3.0787 11.6105 2.99963 11.8014 2.99963 12.0004C2.99963 12.099 3.01904 12.1965 3.05676 12.2876C3.09447 12.3786 3.14974 12.4614 3.21943 12.531L4.71943 14.031C4.78908 14.1008 4.8718 14.1561 4.96285 14.1938C5.05389 14.2316 5.15149 14.251 5.25005 14.251C5.34861 14.251 5.44621 14.2316 5.53726 14.1938C5.6283 14.1561 5.71102 14.1008 5.78068 14.031L8.78068 11.031C8.92141 10.8903 9.00047 10.6994 9.00047 10.5004C9.00047 10.3014 8.92141 10.1105 8.78068 9.96979C8.63995 9.82906 8.44907 9.75 8.25005 9.75C8.05103 9.75 7.86016 9.82906 7.71943 9.96979ZM7.71943 15.9698L5.25005 18.4401L4.28068 17.4698C4.21099 17.4001 4.12827 17.3448 4.03722 17.3071C3.94618 17.2694 3.8486 17.25 3.75005 17.25C3.6515 17.25 3.55392 17.2694 3.46288 17.3071C3.37183 17.3448 3.28911 17.4001 3.21943 17.4698C3.14974 17.5395 3.09447 17.6222 3.05676 17.7132C3.01904 17.8043 2.99963 17.9019 2.99963 18.0004C2.99963 18.099 3.01904 18.1965 3.05676 18.2876C3.09447 18.3786 3.14974 18.4614 3.21943 18.531L4.71943 20.031C4.78908 20.1008 4.8718 20.1561 4.96285 20.1938C5.05389 20.2316 5.15149 20.251 5.25005 20.251C5.34861 20.251 5.44621 20.2316 5.53726 20.1938C5.6283 20.1561 5.71102 20.1008 5.78068 20.031L8.78068 17.031C8.92141 16.8903 9.00047 16.6994 9.00047 16.5004C9.00047 16.3014 8.92141 16.1105 8.78068 15.9698C8.63995 15.8291 8.44907 15.75 8.25005 15.75C8.05103 15.75 7.86016 15.8291 7.71943 15.9698Z"
                                        fill="#E9E9E9"/>
                                </svg>
                                <span>Список задач ({todos.length})</span>
                            </div>
                            <ToDoForm addTask={addTask}/>
                            <div className="tasks-list">
                                {todos.map((todo) => (
                                    <ToDo
                                        key={todo.id}
                                        todo={todo}
                                        toggleTask={handleToggle}
                                        removeTask={removeTask}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Погода на сегодня */}
                        {weatherData && (
                            <div className="container">
                                <div className="header-container">
                                    <img
                                        className="weather-icon"
                                        src={`https://yastatic.net/weather/i/icons/funky/dark/${weatherData.fact.icon}.svg`}
                                        alt="Иконка погоды"
                                    />
                                    <span>Погода сейчас</span>
                                </div>

                                <div>Температура: {weatherData.fact.temp}°C</div>
                                <div>Ощущается как: {weatherData.fact.feels_like}°C</div>
                                <div>Ветер: {weatherData.fact.wind_speed} м/с ({weatherData.fact.wind_dir})</div>
                                <div>Порывы ветра: {weatherData.fact.wind_gust} м/с</div>
                                <div>Влажность: {weatherData.fact.humidity}%</div>
                                <div>Давление: {weatherData.fact.pressure_mm} мм рт. ст.</div>
                                <div>Облачность: {(weatherData.fact.cloudness * 100).toFixed(0)}%</div>
                            </div>
                        )}

                        {/* Данные об IP */}
                        {ipData && (
                            <div className="container">
                                <div className="header-container">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                         viewBox="0 0 24 24">
                                        <path fill="#E9E9E9" d="M4 4h16v2H4zm0 4h10v2H4zm0 4h16v2H4zm0 4h10v2H4z"/>
                                    </svg>
                                    <span>Информация об IP</span>
                                </div>
                                <div>IP: {ipData.ip}</div>
                                <div>Страна: {ipData.country} ({ipData.country_iso})</div>
                                <div>Координаты: {ipData.latitude}, {ipData.longitude}</div>
                                <div>Часовой пояс: {ipData.time_zone}</div>
                                <div>Браузер: {ipData.user_agent.product} {ipData.user_agent.version}</div>
                                <div style={{fontSize: '0.8em', opacity: 0.6}}>
                                    {ipData.user_agent.comment}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

export default App;
