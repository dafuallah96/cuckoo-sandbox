import { h, Component, createRef } from 'preact';
import style from './style.css';

class DragAndDrop extends Component {
    state = {
        drag: false
    }

    constructor(props) {
        super(props);

        this.handleDrag = this.handleDrag.bind(this);
        this.handleDragIn = this.handleDragIn.bind(this);
        this.handleDragOut = this.handleDragOut.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
    }

    ref = createRef();

    handleDrag(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDragIn(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dragCounter++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            this.setState({ drag: true });
        }
    }

    handleDragOut(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dragCounter--;
        if (this.dragCounter === 0) {
            this.setState({ drag: false });
        }
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ drag: false });
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            this.props.handleDrop(e.dataTransfer.files);
            e.dataTransfer.clearData();
            this.dragCounter = 0;
        }
    }

    componentDidMount() {
        let div = this.ref.current;

        div.addEventListener('dragenter', this.handleDragIn);
        div.addEventListener('dragleave', this.handleDragOut);
        div.addEventListener('dragover', this.handleDrag);
        div.addEventListener('drop', this.handleDrop);
    }

    componentWillUnmount() {
        let div = this.ref.current;
        div.removeEventListener('dragenter', this.handleDragIn);
        div.removeEventListener('dragleave', this.handleDragOut);
        div.removeEventListener('dragover', this.handleDrag);
        div.removeEventListener('drop', this.handleDrop);
    }

    render() {
        return (
            <div class={style.dropZone}
                ref={this.ref}
                onClick={this.props.onClickRef}>
                {this.props.children}
            </div>
        )
    }
}

export default DragAndDrop