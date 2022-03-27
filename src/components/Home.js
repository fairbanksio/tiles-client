import React, { Component } from 'react';
import '../styles/App.css';
import axios from 'axios'
import { RingLoader } from 'react-spinners';
import { Link } from "react-router-dom";
import { Input, Grid, Segment, Image, Menu } from 'semantic-ui-react';
import PNGImage from 'pnglib-es6'
import AuthButton from './AuthButton'
import Filter from 'bad-words';

var filter = new Filter();
filter.addWords('maga'); // Items listed here will be replaced with ****
filter.removeWords('hells', 'god'); // Items listed here will NOT be filtered
class Home extends Component {
  constructor() {
    super();
    this.state = {
      isFetching: false,
      error: false
    };
    this.newBoardName = ""
  }
  
  createNewBoard = () => {
    if(filter.isProfane(this.newBoardName)){this.setState({error: true});alert("This board name is not supported.")}else{
      var name = this.newBoardName;
      var color = "#222";
      // Get all users from API
      axios
        .post('https://' + window.REACT_APP_API + '/tiles',  {name: name, baseColor: color})
        .then(res => {
          if(res.data.success){
            this.props.history.push('/'+ res.data.boardId);
          } else {
            console.log(res.data)
          }
        })
        .catch(error => {
          console.log(error);
        })
    }
  }

  handleNameChange = (e) => {
    this.newBoardName = e.target.value
  }

  getAllBoards = () => {
    // Get all users from API
    axios
      .get('https://' + window.REACT_APP_API + '/tiles')
      .then(res => {
        this.setState({ data: res.data ? res.data : [], isFetching:false})
      })
      .catch(error => {
        console.log(error);
      })
  }

  scaleApply(array, factor) {
    const scaled = [];
    for(const row of array) {
      let x = [];
      for(const item of row)
        x.push.apply(x, Array(factor).fill(item));
      scaled.push.apply(scaled, Array(factor).fill(x));
    }
    return scaled;
  }
  
  getBoardPng(tileData, scale){
    if(scale){
      tileData = this.scaleApply(tileData, scale)
    }
    const image = new PNGImage(tileData[0].length, tileData.length, 135,16);
    // Columns
    for (var y = 0; y < tileData.length; y++){
      // Rows
      for (var x = 0; x < tileData[y].length; x++){
        // Set pixels
        image.setPixel(x,y,image.createColor(tileData[y][x]))
      }
    }
    const dataUri = image.getDataURL(); // data:image/png;base64,...
    return dataUri;
  }
  
  componentDidMount() {
    this.setState({ isFetching: true });
    this.getAllBoards();
  }

  render() {
    const { error } = this.state;

   

    return (
      <>
        <Grid columns={12} stackable centered>

          <Grid.Column width={12}>
            <Menu inverted color="grey">
            <img style={{  height: "45px", padding: "-.75em"}} src='/popcanlogo.png' alt='logo'/>
              <Menu.Item position='right'>
                <AuthButton/>
              </Menu.Item>

            </Menu>
          </Grid.Column>

          <Grid.Column width={12}>
            <Segment inverted textAlign='center'>
              <Input 
              error={error}
              action={{ color: 'grey', labelPosition: 'right', icon: 'plus', content: 'New Canvas', onClick: (e)=>this.createNewBoard()} }
              placeholder='Canvas Name'
              onChange={(e)=>this.handleNameChange(e)}
            />
            </Segment>
            
          </Grid.Column>
        </Grid>
        
          
        {!this.state.data ? (
          <Grid columns={12} centered >
            <RingLoader
              sizeUnit={"px"}
              size={40}
              color={'#FFF'}
            />
          </Grid>
        ) :

          <Grid stackable columns={12} centered >
            {this.state.data.filter(board => board.boardLog.length > 0).sort((a, b) => {return b.boardLog.length - a.boardLog.length}).slice(0,21).map((board, key) => {
              const redirPath = "/" + board._id
              return(
                
                  

                    <Grid.Column width={6} key={key}>
                      <Segment inverted>
                      <Link to={redirPath}>
                        <Image
                          src={this.getBoardPng(board.boardData)}
                          alt={"popular-" + board.name}
                          style={{"border":"1px solid #767676", width: "100%", height: "100%", objectFit: "contain"}}
                        />
                        <b>{board.name}</b><br/>
                        <span style={{color: "#666666"}}>{board.boardLog.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " edits"}</span>
                      </Link>
                      </Segment>
                    </Grid.Column>



                
              )
            })}
          </Grid>

        }
      </>
    );
  }
}

export default Home;