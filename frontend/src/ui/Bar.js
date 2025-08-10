import { useState, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
// Socket.io Stuff 
import { socket } from '../functions/online';

// Supabase Stuff
import { supabase } from '../constants/supabaseClient';

export function Bar({setInGame, setPlayerColor, setTurn}) {
    const [signedIn, setSignedIn] = useState(false);
    const [searching, setSearching] = useState(false)
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [userElo, setUserElo] = useState(800)
    const [userWins, setUserWins] = useState(0)
    const [userLosses, setUserLosses] = useState(0)
    const [ingame, _setIngame] = useState(false);
    const [oppUsername, setOppUsername] = useState("")
    const [oppElo, setOppElo] = useState(0)
    
    // State for button UI instead of DOM manipulation
    const [playButtonText, setPlayButtonText] = useState("Play Random");
    const [playButtonColor, setPlayButtonColor] = useState("rgb(122, 230, 123)");
    const [drawButtonText, setDrawButtonText] = useState("Request Draw?");
    const [drawButtonColor, setDrawButtonColor] = useState("Orange");

    // Memoize these functions to prevent recreating them on every render
    const getUserStats = useCallback(async (email) => {
        const {data, error} = await supabase
            .from('players')
            .select('*')
            .eq('email', email)

        if (error){
            console.log(error)
        }else if (data && data.length > 0) {
            const user = data[0];
            setUserWins(user.wins);
            setUserLosses(user.losses);
            setUserElo(user.elo);

            localStorage.setItem('wins', user.wins);
            localStorage.setItem('losses', user.losses);
            localStorage.setItem('elo', user.elo);
        }
    }, []);

    const getOppElo = useCallback(async (email) => {
        const {data, error} = await supabase 
            .from('players')
            .select('*')
            .eq('email', email)
        if (error){
            console.log(error)
        }else if (data && data.length > 0){
            setOppElo(data[0].elo)
        }
    }, []);

    const checkUserInSupabase = useCallback(async (email, username) => {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('email', email);

        if (error) {
            console.error(error);
        } else if (data && data.length > 0) {
            setUserElo(data[0].elo)
            setUserWins(data[0].wins)
            setUserLosses(data[0].losses)
        } else {
            console.log("New user, insert them");
            addUserInSupabase(email, username)
        }
    }, []);

    const addUserInSupabase = useCallback(async(email, username) =>{
        const {data, error} = await supabase
            .from('players')
            .insert({email,username})
        if (error){
            console.error(error);
        }else{
            console.log(data)
        }
    }, []);

    const updateUserElo = useCallback(async(email, newUserElo) =>{
        const {data, error} = await supabase
            .from("players")
            .update({elo : newUserElo})
            .eq('email', email)
        
        if (error) {
            console.error("Supabase update error:", error);
        } else if (!data || data.length === 0) {
            console.warn("No rows updated. Possibly bad email match?");
        } else {
            console.log("ELO updated successfully:", data);
        }
    }, []);

    const updateUserWins = useCallback(async(email, newUserWins) => {
        const {data,error} = await supabase
            .from('players')
            .update({wins: newUserWins})
            .eq('email', email)
        if (error) {
            console.error("Supabase update error:", error);
        } else if (!data || data.length === 0) {
            console.warn("No rows updated. Possibly bad email match?");
        } else {
            console.log("Wins updated successfully:", data);
        }
    }, []);

    const updateUserLosses = useCallback(async(email, newUserLosses) => {
        const {data,error} = await supabase
            .from('players')
            .update({losses: newUserLosses})
            .eq('email', email)
        if (error) {
            console.error("Supabase update error:", error);
        } else if (!data || data.length === 0) {
            console.warn("No rows updated. Possibly bad email match?");
        } else {
            console.log("Losses updated successfully:", data);
        }
    }, []);

    // Initial load effect
    useEffect(() => {
        const storedEmail = localStorage.getItem("email");
        const storedName = localStorage.getItem("name");
        if (storedEmail && storedName) {
            setEmail(storedEmail);
            setUsername(storedName);
            getUserStats(storedEmail)
            setSignedIn(true);
        }
    }, [getUserStats]);

    // Socket event listeners with proper cleanup
    useEffect(() => {
        const handleStartGame = (data) => {
            setPlayButtonText("Quit");
            setPlayButtonColor("Red");
            setDrawButtonText("Draw");
            setDrawButtonColor("Orange");
            
            if (data.players[0] === socket.id) {
                setPlayerColor("white")
                setOppUsername(data.names[1])
                getOppElo(data.emails[1])
            } else {
                // TODO: Move piece removal logic to Board component
                const pieces = Array.from(document.getElementsByClassName("piece"));
                for (const piece of pieces) {
                    piece.remove();
                }
                setPlayerColor("black")
                setTurn("white")
                setOppUsername(data.names[0])
                getOppElo(data.emails[0])
            }
            setInGame(true);
            _setIngame(true);
        };

        const handleUserLeft = (data) => {
            setInGame(false)
            _setIngame(false)
            alert(data.user+" has left the game! (+10)")
            setPlayButtonText("Play Random");
            setPlayButtonColor("rgb(122, 230, 123)");
            
            // Update stats
            const newElo = userElo + 10;
            const newWins = userWins + 1;
            updateUserElo(email, newElo)
            setUserElo(newElo)
            updateUserWins(email, newWins)
            setUserWins(newWins)
        };

        // Subscribe to events
        socket.on("start_game", handleStartGame);
        socket.on("userLeft", handleUserLeft);

        // Cleanup function - remove listeners when component unmounts or dependencies change
        return () => {
            socket.off("start_game", handleStartGame);
            socket.off("userLeft", handleUserLeft);
        };
    }, [setInGame, setPlayerColor, setTurn, getOppElo, email, userElo, userWins, updateUserElo, updateUserWins]);

    const handleLogout = () => {
        googleLogout();
        localStorage.removeItem("email");
        localStorage.removeItem("name");
        setSignedIn(false);
        setEmail("");
        setUsername("");
    };

    const playRandom = () => {
        // Player Requests to Join a Room
        const storedEmail = localStorage.getItem("email");
        const storedName = localStorage.getItem("name");
        socket.emit("find_game", {email: storedEmail, name: storedName})
        setPlayButtonText("Searching");
        setPlayButtonColor("yellow");
    }

    const playFriend = () =>{
        setSearching(true)
    }

    const leaveGame = () =>{
        socket.emit("leaveGame", {user: username, email: email})
        setInGame(false)
        _setIngame(false)
        alert("You have left the game! (-10)")
        setPlayButtonText("Play Random");
        setPlayButtonColor("rgb(122, 230, 123)");
        
        // Update stats
        const newElo = userElo - 10;
        const newLosses = userLosses + 1;
        updateUserElo(email, newElo)
        setUserElo(newElo)
        updateUserLosses(email, newLosses)
        setUserLosses(newLosses)
    }

    if (signedIn) {
        if (ingame){
            return(
                <div className="bar">
                    <h2>{oppUsername}</h2>
                    <h3>{oppElo}</h3>
                    <hr width= "200"/>
                    <button onMouseDown={leaveGame}>Quit</button>
                    <button 
                        id="drawButton" 
                        className='drawButton'
                        style={{ backgroundColor: drawButtonColor }}
                    >
                        {drawButtonText}
                    </button>
                    <hr width= "200"/>
                    <h2 style={{ color: "yellow" }}>{username}</h2>
                    <h3 style={{ color: "yellow" }}>{userElo}</h3>
                </div>
            )
        }else{
            if (searching){
                return(
                    <div className="bar">
                        <h2>Play with a Friend</h2>
                        <button className='createRoom'>Create New Room</button>
                        <hr width= "200"/>
                        <input />
                        <button className='joinRoom'>Join Room</button>
                        <button className='backButton' onClick={() => setSearching(false)}>Back</button>

                    </div>
                )
            }else{
                return (
                    <div className="bar">
                        <h1 className='welcome'>Welcome, {username}!</h1>
                        <h3 className='displayElo'>{userElo}</h3>
                        <h3 className='displayWs'>Wins: {userWins} | Losses: {userLosses}</h3>
                        <button 
                            className='playRandom' 
                            id="playRandom" 
                            style={{ backgroundColor: playButtonColor }}
                            onMouseDown={playRandom}
                        >
                            {playButtonText}
                        </button>
                        <button className='playFriend' id="playFriend" onMouseDown={() => setSearching(true)}>Play Friend</button>
                        <button onClick={handleLogout} className='logoutButton'>Logout</button>
                    </div>
                );
            }
            
        }
        
    } else {
        return (
            <div className="bar">
                <h1 className='signTitle'>Sign in to Google!</h1>
                <GoogleLogin
                    onSuccess={(credentialResponse) => {
                        const decoded = jwtDecode(credentialResponse.credential);
                        setSignedIn(true);
                        setEmail(decoded.email);
                        setUsername(decoded.name);
                        localStorage.setItem("email", decoded.email);
                        localStorage.setItem("name", decoded.name);
                        checkUserInSupabase(decoded.email, decoded.name);
                    }}
                    onError={() => console.log("Login Failed")}
                />
            </div>
        );
    }
}