
import Logo from '../components/Logo';
import Navigation from '../components/Navigation';
import GameInterface from '../components/GameInterface';

// import ScriptTag from 'react-script-tag';
// const Demo = props => (
//     <ScriptTag type="module" src="./GameScript/index.ts" />
// )
const Game = () => {
    return (
        <div>
            <Logo />
            <Navigation />
            <GameInterface />
        </div>



    );
};

export default Game;