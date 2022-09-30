import Background from '../components/Background';
import Canvas from '../components/Canvas';
import Display from '../components/Display';

const GameInterface = () => {
    return (
        <div className="gameInterface" id="gameInterface">
            <Canvas />
            <Background />
            <Display />
        </div >
    );
};

export default GameInterface;