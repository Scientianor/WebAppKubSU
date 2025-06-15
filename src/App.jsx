import React, {useState, useEffect} from 'react';
import './App.css';
import ToDoForm from './AddTask';
import ToDo from './Task';
import IPMap from './IPMap';
import axios from 'axios';

const TASKS_STORAGE_KEY = 'tasks-list-project-web';

function App() {
    const [rates, setRates] = useState({});
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [todos, setTodos] = useState([]);
    const [ipData, setIpData] = useState(null);
    const [news, setNews] = useState([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await axios.get('https://gnews.io/api/v4/top-headlines', {
                    params: {
                        country: 'ru',
                        category: 'general',
                        max: 5,
                        apikey: 'd02931d252c0851edd008843744ef325'
                    }
                });
                setNews(res.data.articles);
            } catch (err) {
                console.error('Ошибка загрузки новостей:', err);
            }
        };

        fetchNews();
    }, []);

    useEffect(() => {
        const replaceLeafletFlag = () => {
            const flagEl = document.querySelector('.leaflet-attribution-flag');
            if (flagEl && flagEl.tagName === 'svg') {
                flagEl.remove();
            }

            const container = document.querySelector('.leaflet-control-attribution');
            if (container) {
                // Проверка на уже вставленный флаг
                if (!container.querySelector('img.leaflet-attribution-flag')) {
                    const img = document.createElement('img');
                    img.src = 'https://flagcdn.com/w40/ru.png';
                    img.alt = 'Russia Flag';
                    img.className = 'leaflet-attribution-flag';
                    img.style.height = '12px';
                    img.style.marginRight = '5px';
                    img.style.verticalAlign = 'middle';

                    container.insertBefore(img, container.firstChild);
                }
            }
        };

        setTimeout(replaceLeafletFlag, 1000); // ждём загрузки карты
    }, []);

useEffect(() => {
    async function fetchAllData() {
        try {
            // Курсы валют (USD, EUR, CNY) к RUB
            const [usd, eur, cny, ipResponse] = await Promise.all([
                axios.get('https://v6.exchangerate-api.com/v6/3ee38075a1e840e9ef7b3a24/latest/USD'),
                axios.get('https://v6.exchangerate-api.com/v6/3ee38075a1e840e9ef7b3a24/latest/EUR'),
                axios.get('https://v6.exchangerate-api.com/v6/3ee38075a1e840e9ef7b3a24/latest/CNY'),
                axios.get('https://ipinfo.io/json?token=a6cdee07cef0e0'),
            ]);

            setIpData(ipResponse.data);

            const USDrate = usd.data.conversion_rates.RUB.toFixed(2).replace('.', ',');
            const EURrate = eur.data.conversion_rates.RUB.toFixed(2).replace('.', ',');
            const CNYrate = cny.data.conversion_rates.RUB.toFixed(2).replace('.', ',');

            setRates({ USDrate, EURrate, CNYrate });

            // Погода по IP-геолокации
            if (ipResponse.data.loc) {
                const [lat, lon] = ipResponse.data.loc.split(',');

                const weatherResponse = await axios.get(
                    `https://api.weather.yandex.ru/v2/forecast?lat=${lat}&lon=${lon}&lang=ru_RU`,
                    {
                        headers: {
                            'X-Yandex-Weather-Key': '5254d49c-4ca4-44f5-b90e-c3a9c6cd038f'
                        }
                    }
                );

                setWeatherData(weatherResponse.data);
            }
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
                        <div style={{display: 'flex', gap: '1rem', flexDirection: 'column'}}>
                            {/* Курс валют */}
                            <div className="container width-100">
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
                                <div id="USD"><b>USD ($):</b> {rates.USDrate}₽</div>
                                <div id="EUR"><b>EUR (€):</b> {rates.EURrate}₽</div>
                                <div id="CNY"><b>CNY (¥):</b> {rates.CNYrate}₽</div>
                            </div>

                            {/* Новости */}
                            <div className="container width-100">
                                <div className="header-container">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none">
                                        <path opacity="0.2"
                                              d="M9 22.5L10.5 15L4.5 12.75L15 1.5L13.5 9L19.5 11.25L9 22.5Z"
                                              fill="#E9E9E9"/>
                                        <path
                                            d="M20.2303 11.0786C20.2019 10.9584 20.1443 10.847 20.0625 10.7545C19.9807 10.6619 19.8774 10.591 19.7616 10.548L14.3607 8.52203L15.735 1.64734C15.7662 1.48761 15.7445 1.32209 15.6733 1.17576C15.6021 1.02943 15.4852 0.910224 15.3403 0.836138C15.1954 0.762052 15.0304 0.737102 14.8701 0.765053C14.7097 0.793004 14.5629 0.872339 14.4516 0.991087L3.95159 12.2411C3.86631 12.3309 3.80462 12.4405 3.77203 12.5601C3.73943 12.6796 3.73696 12.8053 3.76481 12.926C3.79267 13.0467 3.84999 13.1587 3.93166 13.2518C4.01334 13.345 4.11681 13.4164 4.23284 13.4598L9.63566 15.4858L8.26503 22.353C8.23391 22.5127 8.25558 22.6782 8.32679 22.8245C8.39799 22.9709 8.51485 23.0901 8.65974 23.1642C8.80464 23.2382 8.96969 23.2632 9.13001 23.2352C9.29032 23.2073 9.4372 23.128 9.54847 23.0092L20.0485 11.7592C20.1322 11.6693 20.1926 11.5603 20.2243 11.4416C20.256 11.3229 20.2581 11.1983 20.2303 11.0786ZM10.2535 20.0626L11.235 15.152C11.2702 14.9779 11.2423 14.7969 11.1565 14.6413C11.0706 14.4858 10.9324 14.3658 10.7663 14.3026L5.81253 12.4417L13.7457 3.94234L12.765 8.85296C12.7299 9.02712 12.7577 9.20809 12.8436 9.36364C12.9294 9.5192 13.0677 9.63922 13.2338 9.70234L18.1838 11.5586L10.2535 20.0626Z"
                                            fill="#E9E9E9"/>
                                    </svg>
                                    <span>Новости</span>
                                </div>

                                {news.length === 0 && <div>Нет новостей</div>}

                                <ul style={{listStyle: 'none', padding: 0}}>
                                    {news.map((article, index) => (
                                        <li key={index} style={{marginBottom: '10px'}}>
                                            <a href={article.url} target="_blank" rel="noopener noreferrer"
                                               style={{
                                                   color: 'var(--color)',
                                                   whiteSpace: 'nowrap',
                                                   fontSize: '.85rem',
                                                   fontWeight: 'bold',
                                                   textDecoration: 'none',
                                                   overflow: 'hidden',
                                                   textOverflow: 'ellipsis',
                                                   display: 'inline-block',
                                                   maxWidth: '100%' // можно уменьшить до 250px для точного визуального ограничения
                                               }}>
                                                {article.title.length > 32 ? article.title.slice(0, 32) + '…' : article.title}
                                            </a>
                                            <div style={{fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.4)'}}>
                                                {new Date(article.publishedAt).toLocaleString('ru-RU')}
                                            </div>
                                            {article.description && (
                                                <div style={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '250px',
                                                    fontSize: '.75rem'
                                                }}>
                                                    {article.description.length > 64
                                                        ? article.description.slice(0, 64) + '…'
                                                        : article.description}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
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

                        <div style={{display: 'flex', gap: '1rem', flexDirection: 'column'}}>
                            {/* Погода на сегодня */}
                            {weatherData && (
                                <div className="container width-100">
                                    <div className="header-container">
                                        <img
                                            className="weather-icon"
                                            src={`https://yastatic.net/weather/i/icons/funky/dark/${weatherData.fact.icon}.svg`}
                                            alt="Иконка погоды"
                                        />
                                        <span>Погода сейчас</span>
                                    </div>

                                    <div><b>Температура:</b> {weatherData.fact.temp}°C</div>
                                    <div><b>Ощущается как:</b> {weatherData.fact.feels_like}°C</div>
                                    <div><b>Ветер:</b> {weatherData.fact.wind_speed} м/с ({weatherData.fact.wind_dir})
                                    </div>
                                    <div><b>Порывы ветра:</b> {weatherData.fact.wind_gust} м/с</div>
                                    <div><b>Влажность:</b> {weatherData.fact.humidity}%</div>
                                    <div><b>Давление:</b> {weatherData.fact.pressure_mm} мм рт. ст.</div>
                                    <div><b>Облачность:</b> {(weatherData.fact.cloudness * 100).toFixed(0)}%</div>
                                </div>
                            )}

                            {/* Данные об IP */}
                            {ipData && (
                                <div className="container width-100">
                                    <div className="header-container">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                             viewBox="0 0 24 24" fill="none">
                                            <path opacity="0.2"
                                                  d="M12 2.25C10.0109 2.25 8.10322 3.04018 6.6967 4.4467C5.29018 5.85322 4.5 7.76088 4.5 9.75C4.5 16.5 12 21.75 12 21.75C12 21.75 19.5 16.5 19.5 9.75C19.5 7.76088 18.7098 5.85322 17.3033 4.4467C15.8968 3.04018 13.9891 2.25 12 2.25ZM12 12.75C11.4067 12.75 10.8266 12.5741 10.3333 12.2444C9.83994 11.9148 9.45542 11.4462 9.22836 10.8981C9.0013 10.3499 8.94189 9.74667 9.05764 9.16473C9.1734 8.58279 9.45912 8.04824 9.87868 7.62868C10.2982 7.20912 10.8328 6.9234 11.4147 6.80764C11.9967 6.69189 12.5999 6.7513 13.148 6.97836C13.6962 7.20542 14.1648 7.58994 14.4944 8.08329C14.8241 8.57664 15 9.15666 15 9.75C15 10.5456 14.6839 11.3087 14.1213 11.8713C13.5587 12.4339 12.7956 12.75 12 12.75Z"
                                                  fill="#E9E9E9"/>
                                            <path
                                                d="M12 6C11.2583 6 10.5333 6.21993 9.91661 6.63199C9.29993 7.04404 8.81928 7.62971 8.53545 8.31494C8.25162 9.00016 8.17736 9.75416 8.32205 10.4816C8.46675 11.209 8.8239 11.8772 9.34835 12.4017C9.8728 12.9261 10.541 13.2833 11.2684 13.4279C11.9958 13.5726 12.7498 13.4984 13.4351 13.2145C14.1203 12.9307 14.706 12.4501 15.118 11.8334C15.5301 11.2167 15.75 10.4917 15.75 9.75C15.75 8.75544 15.3549 7.80161 14.6517 7.09835C13.9484 6.39509 12.9946 6 12 6ZM12 12C11.555 12 11.12 11.868 10.75 11.6208C10.38 11.3736 10.0916 11.0222 9.92127 10.611C9.75097 10.1999 9.70642 9.7475 9.79323 9.31105C9.88005 8.87459 10.0943 8.47368 10.409 8.15901C10.7237 7.84434 11.1246 7.63005 11.561 7.54323C11.9975 7.45642 12.4499 7.50097 12.861 7.67127C13.2722 7.84157 13.6236 8.12996 13.8708 8.49997C14.118 8.86998 14.25 9.30499 14.25 9.75C14.25 10.3467 14.0129 10.919 13.591 11.341C13.169 11.7629 12.5967 12 12 12ZM12 1.5C9.81273 1.50248 7.71575 2.37247 6.16911 3.91911C4.62247 5.46575 3.75248 7.56273 3.75 9.75C3.75 12.6937 5.11031 15.8138 7.6875 18.7734C8.84552 20.1108 10.1489 21.3151 11.5734 22.3641C11.6995 22.4524 11.8498 22.4998 12.0037 22.4998C12.1577 22.4998 12.308 22.4524 12.4341 22.3641C13.856 21.3147 15.1568 20.1104 16.3125 18.7734C18.8859 15.8138 20.25 12.6937 20.25 9.75C20.2475 7.56273 19.3775 5.46575 17.8309 3.91911C16.2843 2.37247 14.1873 1.50248 12 1.5ZM12 20.8125C10.4503 19.5938 5.25 15.1172 5.25 9.75C5.25 7.95979 5.96116 6.2429 7.22703 4.97703C8.4929 3.71116 10.2098 3 12 3C13.7902 3 15.5071 3.71116 16.773 4.97703C18.0388 6.2429 18.75 7.95979 18.75 9.75C18.75 15.1153 13.5497 19.5938 12 20.8125Z"
                                                fill="#E9E9E9"/>
                                        </svg>
                                        <span>Информация об IP</span>
                                    </div>

                                    {/* Карта по координатам */}
                                    <IPMap lat={parseFloat(ipData.loc.split(',')[0])}
                                           lon={parseFloat(ipData.loc.split(',')[1])}/>

                                    <div><b>IP:</b> {ipData.ip}</div>
                                    <div><b>Город:</b> {ipData.city}</div>
                                    <div><b>Провайдер:</b> {ipData.org}</div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default App;
