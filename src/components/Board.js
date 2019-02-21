import React, { Component } from "react";
import '../styles/Board.css';
import { SketchPicker } from 'react-color';
import io from "socket.io-client";
import axios from 'axios'
import { Link } from 'react-router-dom'
import Draggable from 'react-draggable'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RingLoader } from 'react-spinners';

const socketUrl = "https://" + process.env.REACT_APP_API;

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      boardState: false,
      color: '#FFF',
      socket:null,
      boardLog: false,
      draggablePos: {x:100,y:100},
      userCount: 1,
    };
    this.draggingPopup = false;
    this.pendingChanges= []
  }

  getBoardLog = () => {
    // Get all users from API
    this.setState({fetchingLog: true})
    axios
      .get('https://' + process.env.REACT_APP_API + '/tiles/' + this.props.match.params.boardId + '/log')
      .then(res => {
        this.setState({ data: res.data ? res.data : [], isFetching:false})
        //console.log(res.data)
        this.setState({fetchingLog: false})
      })
      .catch(error => {
        console.log(error);
        this.setState({fetchingLog: false})
      })
  }

  componentWillMount() {
		this.initSocket()
  }

  initSocket = ()=>{
		const socket = io(socketUrl)
		socket.on('connect', ()=>{
      //console.log("Connected");
      socket.emit("joinChannel", this.props.match.params.boardId);
    })
    socket.on('updateConnections', newConnectionCount => {
      this.setState({userCount: newConnectionCount})
    })
    socket.on("disconnect", () => {
      //console.log("Disconnected");
    });
		this.setState({socket})
  }
  componentWillUnmount(){
    const { socket} = this.state;
    socket.disconnect()
  }
  componentDidMount() {
    // DEFINE SOCKET EVENT LISTENERS
    const { socket} = this.state;
    socket.on("setBoardState", receivedState => {
      this.setState({boardState: receivedState});
    })

    socket.on("updateTiles", tileUpdateData => {
      var desiredState = {...this.state.boardState}
      for (var i = 0; i < tileUpdateData.length; i++ ){
        desiredState.tiles[tileUpdateData[i].x][tileUpdateData[i].y] = tileUpdateData[i].color 
      }
      this.setState({boardState: desiredState});
    })

    toast('✏️ Click to begin drawing!', {
      position: "bottom-right",
      autoClose: 5500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      type: toast.TYPE.SUCCESS
    });

    setTimeout(() => {
      toast('🌈 Right click to change colors!', {
        position: "bottom-right",
        autoClose: 5500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        type: toast.TYPE.INFO
      });
    }, 12000);
	}

  changeTileColor(x,y,e) {
    if((e.buttons === 1 || e.buttons === 3) && this.draggingPopup === false){
      var desiredState = {...this.state.boardState}
      var {color} = this.state;
      var tileUpdateData = {}
      tileUpdateData.x = x
      tileUpdateData.y = y
      tileUpdateData.color = color
      if (desiredState.tiles[x][y] === color){
        desiredState.tiles[x][y] = desiredState.baseColor;
        tileUpdateData.color = desiredState.baseColor
        e.target.setAttribute("bgColor", desiredState.baseColor);
        this.pendingChanges.push(tileUpdateData);
      } else {
        desiredState.tiles[x][y] = color;
        e.target.setAttribute("bgColor", color);
        this.pendingChanges.push(tileUpdateData);
      }
    } else {}
  }

  changeTileColorMouseMove(x,y,e) {
    if((e.buttons === 1 || e.buttons === 3) && this.draggingPopup === false){
      var desiredState = {...this.state.boardState}
      var {color} = this.state;
      var tileUpdateData = {}
      tileUpdateData.x = x
      tileUpdateData.y = y
      tileUpdateData.color = color

      this.pendingChanges.push(tileUpdateData);
      e.target.setAttribute("bgColor", color);
      desiredState.tiles[x][y] = color;

      e.stopPropagation();
      e.preventDefault();
    }
  }

  handleMouseUp(){
    const { socket} = this.state;
    socket.emit("updateTiles", this.props.match.params.boardId, this.selectUniqueChanges(this.pendingChanges))
    this.pendingChanges= []
  }

  handleColorPicker = (color) => {
    this.setState({ color: color.hex});
  };

  handleDragStart = () => {
    this.draggingPopup = true;
  }

  handleDragStop = () => {
    this.draggingPopup = false;
  }

  onContextMenu = (e) => {
    var draggable = document.getElementById("#draggable")
    draggable.style.transform = ""
    draggable.style.top = e.clientY + "px"
    draggable.style.left = e.clientX + "px"
    draggable.style.display="inline-block"
    
    e.preventDefault();
  }

  selectUniqueChanges(arr) {
    var uniques = [];
    var itemsFound = {};
    for(var i = 0, l = arr.length; i < l; i++) {
        var stringified = JSON.stringify(arr[i]);
        if(itemsFound[stringified]) { continue; }
        uniques.push(arr[i]);
        itemsFound[stringified] = true;
    }
    return uniques;
  }

  render() {
    const { boardState,draggablePos } = this.state;
    return (
      <div >
        {boardState
          ? <div style={{"textAlign":"left"}}>
              <ToastContainer
                position="top-right"
                autoClose={10000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnVisibilityChange={false}
                draggable
                pauseOnHover
              />
              <ToastContainer />
              <Draggable
                handle=".handle"
                defaultPosition={{x: draggablePos.x, y: draggablePos.y}}
                bounds="parent"
                position={null}
                scale={1}
                onStart={this.handleDragStart}
                onDrag={this.handleDrag}
                onStop={this.handleDragStop}
              >
                  <div className="draggable-wrapper" id="#draggable" style={{"display":"none"}}>
                    <div className="handle" onMouseOver={()=>{document.body.style.cursor = "move"}} onMouseOut={()=>{document.body.style.cursor = "default"}}><i style={{color:"#707070"}} className="fas fa-arrows-alt"/></div>
                    <div className="handle-close" onMouseOver={()=>{document.body.style.cursor = "pointer"}} onMouseOut={()=>{document.body.style.cursor = "default"}} onClick={(e)=>{e.currentTarget.parentElement.style.display="none"}}><i style={{color:"#707070"}} className="fas fa-times"/></div>
                    <SketchPicker
                      color={ this.state.color }
                      onChangeComplete={ this.handleColorPicker }
                    />
                    <div className="draggable-more" style={{margin: "10px 0 10px 0"}}>
                      <span>
                        <div id="circle">
                        <i style={{color:"#707070", margin: "5px 0 0 3.1px"}} className="fas fa-users"/></div>
                        <Link style={{color:"#707070", textAlign: "center", fontSize: "16px", paddingLeft: "5px"}} to="#">{this.state.userCount} User(s) Online</Link>
                      </span>
                      <hr style={{margin:"10px 0 10px 0"}} />
                      <span>
                        <i style={{color:"#707070"}} className="fas fa-home"/>
                        <Link style={{color:"#707070", textAlign: "center", fontSize: "16px", padding: "5px"}} to="/">Return Home</Link>
                      </span>
                    </div>
                </div>
              </Draggable >
              <table className="center">
                <tbody>
                  {boardState.tiles.map((row, i) =>
                    <tr key={i}>
                      {row.map((col, j) =>
                        <td key={j} onMouseMove={(e)=>{ this.changeTileColorMouseMove(i,j,e) }} onMouseDown={(e)=>{ this.changeTileColor(i,j,e) }} onMouseUp={()=>this.handleMouseUp()} onContextMenu={(e)=>{this.onContextMenu(e)}}bgcolor={col}></td>
                      )}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          :
            <div className="centered-vh">
              <RingLoader
                sizeUnit={"px"}
                size={125}
                color={'#36D8B7'}
              />
            </div>
        }
      </div>
    );
  }
}
export default Board;
