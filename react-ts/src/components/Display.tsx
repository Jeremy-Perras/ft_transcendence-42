
import Score from '../components/Score';
import Start from '../components/Start';
import Info from '../components/Info';

const Display = () => {
    return (
        <div className="display" id="display">
            <Score />
            <Start />
            <Info />
        </div >
    );
};

export default Display;