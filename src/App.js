import React from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      blogs: [],
      title: '',
      author: '',
      url: '',
      error: '',
      username: '',
      password: '',
      user: null,
      loginVisible: '',
      infoVisible: ''
    }
  }

  componentDidMount() {
    blogService.getAllSorted().then(blogs =>
      this.setState({ blogs })
    )

    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      this.setState({user})
      blogService.setToken(user.token)
    }  
  }

  addBlog = (event) => {
    event.preventDefault()
    const blogObject = {
      title: this.state.title,
      author: this.state.author,
      url: this.state.url
    }
    const newBlog = blogService.create(blogObject)
    this.setState({
      title: '',
      author: '',
      url: '',
      blogs: this.state.blogs.concat(newBlog),
      error: 'blog '+ blogObject.title +' added succesfully'
    })
  }

  likeBlog = (event) => {
    const blogObject = {
      user: event.user,
      likes: event.likes+1,
      title: event.title,
      author: event.author,
      url: event.author
    }
    blogService.update(blogObject)
    this.setState({
      error: 'like added succesfully'
    })
  }

  login = async (event) => {
    event.preventDefault()
    try{
      const user = await loginService.login({
        username: this.state.username,
        password: this.state.password
      })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      this.setState({ username: '', password: '', user})
    } catch(exception) {
      this.setState({
        error: 'wrong username or password'
      })
      setTimeout(() => {
        this.setState({ error: null })
      }, 5000)
    }
  }

  logout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    this.setState({ 
      user: null,
      error: 'logout succesful'
    })
  }

  handlePasswordChange = (e) => {
    this.setState({ password: e.target.value })
  }

  handleUsernameChange = (e) => {
    this.setState({ username: e.target.value })
  }

  handleFieldChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  render() {
    const loginForm = () => {
      const hideWhenVisible = { display: this.state.loginVisible ? 'none' : '' }
      const showWhenVisible = { display: this.state.loginVisible ? '' : 'none' }
      return (
        <div>
          <div style={hideWhenVisible}>
            <h2>Log in to application</h2>
            <button onClick={e => this.setState({ loginVisible: true })}>log in</button>
          </div>
          <div style={showWhenVisible}>
          <form onSubmit={this.login}>
            <div>
              <p>username:
                <input
                type="text"
                name="username"
                value={this.state.username}
                onChange={this.handleFieldChange}
                />
              </p>
              <p>password:
              <input
                type="password" 
                name="password"
                value={this.state.password}
                onChange={this.handleFieldChange}
              />
              </p>
            </div>
            <button type="submit">log in</button>
          </form>
          <button onClick={e => this.setState({ loginVisible: false })}>cancel</button>
        </div>
      </div>
      )
    }
    const blogStyle = {
      paddingTop: 10,
      paddingLeft: 2,
      border: 'solid',
      borderWidth: 1,
      marginBottom: 5
    }
    
    const blogForm = () => {
      return (
        <div>
          <div>
            {this.state.user.username} logged in
            <button onClick={this.logout}>Logout</button>
          </div>
          <h2>create new blog</h2>
          <form onSubmit={this.addBlog}>
            <div>title 
              <input 
                name="title"
                title={this.state.title}
                onChange={this.handleFieldChange}
              />
            </div>
            <div>
              <div>author
                <input
                  name="author" 
                  author={this.state.author}
                  onChange={this.handleFieldChange}
                />
              </div>
              <div>url
                <input 
                  name="url"
                  url={this.state.url}  
                  onChange={this.handleFieldChange}
                />
              </div>
              <button>create</button>
            </div>
          </form>
          <div style={blogStyle}>
            <div>
              {this.state.blogs.map(blog =>
                <Blog key={blog._id} blog={blog}/>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div>
        <h1>Blogs</h1>
        <Notification message={this.state.error}/>
        {this.state.user === null && loginForm()}
        {this.state.user !== null && blogForm()}
      </div>
    )
  }
}

export default App;
