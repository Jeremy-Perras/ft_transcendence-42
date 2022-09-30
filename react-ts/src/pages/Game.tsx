
import Logo from '../components/Logo';
import Navigation from '../components/Navigation';
import GameInterface from '../components/GameInterface';

import ScriptTag from 'react-script-tag';
const Demo = props => (
    <ScriptTag type="module" src="./GameScript/index.ts" />
)
const Game = () => {
    return (
        <div>
            <div>
                <Logo />
                <Navigation />
            </div>
            <GameInterface />
            <Demo />
            {/* <script type="module" src="./GameScript/index.ts"></script> */}
        </div>



    );
};

export default Game;