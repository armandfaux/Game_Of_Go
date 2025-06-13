function HomePage() {
    return (
        <div className="home-page">
        <h1>Welcome to the Game</h1>
        <p>This is the home page of the game. You can navigate to different sections from here.</p>
        <ul>
            <li><a href="/game">Start Game</a></li>
            {/* <li><a href="/rules">Game Rules</a></li>
            <li><a href="/about">About Us</a></li> */}
        </ul>
        </div>
    );
}


export default HomePage