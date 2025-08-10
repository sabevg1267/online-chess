import { useState, useEffect } from 'react';
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

    useEffect(() => {
        const storedEmail = localStorage.getItem("email");
        const storedName = localStorage.getItem("name");
        if (storedEmail && storedName) {
            setEmail(storedEmail);
            setUsername(storedName);
            getUserStats(storedEmail)
            setSignedIn(true);
        }
    }, []);



    const getUserStats = async (email) => {
        const {data, error} = await supabase
            .from('players')
            .select('*')
            .eq('email', email)

        if (error){
            console.log(error)
        }else if (data.length > 0) {
            const user = data[0];
            setUserWins(user.wins);
            setUserLosses(user.losses);
            setUserElo(user.elo);

            localStorage.setItem('wins', user.wins);
            localStorage.setItem('losses', user.losses);
            localStorage.setItem('elo', user.elo);
        }
    }

    const getOppElo = async (email) => {
        const {data, error} = await supabase 
            .from('players')
            .select('*')
            .eq('email', email)
        if (error){
            console.log(error)
        }else{
            setOppElo(data[0].elo)
        }
    }

    const checkUserInSupabase = async (email, username) => {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('email', email);

        if (error) {
            console.error(error);
        } else if (data.length > 0) {
            setUserElo(data[0].elo)
            setUserWins(data[0].wins)
            setUserLosses(data[0].losses)
        } else {
            console.log("New user, insert them");
            addUserInSupabase(email, username)
        }
    };

    const addUserInSupabase = async(email, username) =>{
        const {data, error} = await supabase
            .from('players')
            .insert({email,username})
        if (error){
            console.error(error);
        }else{
            console.log(data)
        }
    }

    const updateUserElo = async(email, newUserElo) =>{
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
    }  

    const updateUserWins = async(email, newUserWins) => {
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
    }

    const updateUserLosses = async(email, newUserLosses) => {
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
    }

    const handleLogout = () => {
        googleLogout();
        localStorage.removeItem("email");
        localStorage.removeItem("name");
        setSignedIn(false);
        setEmail("");
        setUsername("");
    };

    const playRandom = (data) => {
        // Player Requests to Join a Room
        const storedEmail = localStorage.getItem("email");
        const storedName = localStorage.getItem("name");
        socket.emit("find_game", {email: storedEmail, name: storedName})
        const randomButton = document.getElementById("playRandom")
        randomButton.textContent = "Searching"
        randomButton.style.backgroundColor = "yellow"
    }

    const playFriend = () =>{
        setSearching(true)
    }

    socket.on("start_game", (data) => {
        setTimeout(() => {
            const randomButton = document.getElementById("playRandom");
            if (randomButton) {
                randomButton.textContent = "Quit";
                randomButton.style.backgroundColor = "Red";
            }

            const drawButton = document.getElementById("drawButton");
            if (drawButton) {
                drawButton.textContent = "Draw";
                drawButton.style.backgroundColor = "Orange";
            }
        }, 100); // 100ms delay to wait for DOM
        if (data.players[0] === socket.id) {
            setPlayerColor("white")
            setOppUsername(data.names[1])
            getOppElo(data.emails[1])
        } else {
            const pieces = Array.from(document.getElementsByClassName("piece"));
            for (const piece of pieces) {
                piece.remove();
            }
            setPlayerColor("black")
            setTurn("white")
            setOppUsername(data.names[0])
            getOppElo(data.emails[0])
        }
        setInGame(true); // Lifts it up to App and Board
        _setIngame(true); // Just for Bar’s conditional rendering
    });

    const leaveGame = () =>{
        socket.emit("leaveGame", {user: username, email: email})
        setInGame(false)
        _setIngame(false)
        alert("You have left the game! (-10)")
        setTimeout(() =>{
            const randomButton = document.getElementById("playRandom")
            randomButton.textContent = "Play Random"
            randomButton.style.backgroundColor = "rgb(122, 230, 123)"
        }, 100)
        updateUserElo(email, userElo - 10)
        setUserElo(userElo-10)
        updateUserLosses(email, userLosses + 1)
        setUserLosses(userLosses + 1)
    }

    socket.on("userLeft", (data) =>{
        setInGame(false)
        _setIngame(false)
        alert(data.user+" has left the game! (+10)")
        setTimeout(() =>{
            const randomButton = document.getElementById("playRandom")
            randomButton.textContent = "Play Random"
            randomButton.style.backgroundColor = "rgb(122, 230, 123)"
        }, 100)
        updateUserElo(email, userElo + 10)
        setUserElo(userElo + 10)
        updateUserWins(email, userWins + 1)
        setUserWins(userWins+1)
    })


    if (signedIn) {
        if (ingame){
            return(
                <div className="bar">
                    <h2>{oppUsername}</h2>
                    <h3>{oppElo}</h3>
                    <hr width= "200"/>
                    <button onMouseDown={leaveGame}>Quit</button>
                    <button id = "drawButton" className='drawButton'>Request Draw?</button>
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
                        <button className='playRandom' id = "playRandom" onMouseDown={playRandom}>Play Random</button>
                        <button className='playFriend' id = "playFriend" onMouseDown={() => setSearching(true)}>Play Friend</button>
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
