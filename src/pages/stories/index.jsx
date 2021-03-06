import React, { Component } from "react";
import { Alert, Button, Col, Container, Form, Modal, Row } from "react-bootstrap";
import ReactQuill from "react-quill";
import { Link } from "react-router-dom";
import CategoryPicker from "../../components/CategoryPicker";
import { deleteFunction, getFunction, putFunction } from "../../functions/CRUDFunction";

export default class Stories extends Component {
  state = {
    articles: [],
    currentArticle: {
      headLine: "",
      subHead: "",
      content: "",
      category: {
        name: "",
        img: "",
      },
      _id: "",
      author: "",
      cover: "",
    },
    user: {
      _id: "6000abec6be406061cbda560",
      name: "Vanessa",
      img: "https://myworkspace.matrix42.com/wp-content/plugins/all-in-one-seo-pack/images/default-user-image.png",
    },
    confirm: false,
    msg: [],
    loading: false,
  };
  getArticles = async () => {
    const { articles } = await getFunction("users/" + this.state.user._id);
    if (articles) this.setState({ articles });
    else this.setState({ msg: "No articles Found" });
  };
  componentDidMount = () => {
    this.getArticles();
  };
  verify = () => {
    const { content, headLine, category, author } = this.state.currentArticle;
    return headLine.length < 1
      ? "Please add Title"
      : content.length < 1
      ? "Please add content"
      : category.name.length < 1
      ? "Please chose a category"
      : author.name.length < 1
      ? "Please log in to Post"
      : true;
  };
  updateArticle = async (e) => {
    e.preventDefault();
    const verified = this.verify();
    if (verified === true) {
      this.setState({ loading: true });
      const response = await putFunction("articles/" + this.state.currentArticle._id, this.state.currentArticle);
      console.log(response);
      if (response) {
        this.setState({ msg: "Article Updated" });
        this.getArticles();
        setTimeout(() => {
          this.setState({
            loading: false,
            msg: "",
            article: {
              headLine: "",
              subHead: "",
              content: "",
              _id: "",
              category: {
                name: "",
                img: "",
              },
              author: "",
              cover: "",
            },
          });
        }, 1500);
      }
    } else {
      this.setState({ msg: verified });
      setTimeout(() => {
        this.setState({ msg: "" });
      }, 2500);
    }
  };
  deleteArticle = async () => {
    this.setState({ loading: true });
    const response = await deleteFunction("articles/" + this.state.currentArticle._id);
    console.log(response);
    if (response.ok) {
      this.setState({ msg: "Article Deleted" });
      this.getArticles();
      setTimeout(() => {
        this.setState({
          loading: false,
          msg: "",
          currentArticle: {
            headLine: "",
            subHead: "",
            content: "",
            _id: "",
            category: {
              name: "",
              img: "",
            },
            author: "",
            cover: "",
            loading: false,
          },
        });
      }, 1500);
    } else {
      console.log(response);
    }
  };
  render() {
    const { msg, loading, articles, currentArticle, confirm } = this.state;
    const { headLine, subHead, content, category, cover } = currentArticle;
    return loading ? (
      <div> loading... </div>
    ) : (
      <Container>
        {msg.length > 0 && (
          <Alert variant='warning' className='sticky-alert'>
            {msg}
          </Alert>
        )}
        {headLine && !confirm && (
          <Form onSubmit={this.updateArticle}>
            <Button className='justify-self-end' variant='light' onClick={() => this.setState({ currentArticle: {} })}>
              X
            </Button>
            <div className='category-container'>
              <CategoryPicker
                topic={category}
                onChange={(topic) => {
                  const currentArticle = { ...this.state.currentArticle };
                  currentArticle.category = topic;
                  this.setState({ currentArticle });
                }}
              />
            </div>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type='text'
                value={headLine}
                onChange={(e) => {
                  const currentArticle = { ...this.state.currentArticle };
                  currentArticle.headLine = e.target.value;
                  this.setState({ currentArticle });
                }}
                placeholder='Title'
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Sub Header</Form.Label>
              <Form.Control
                type='text'
                value={subHead}
                as='textarea'
                rows={3}
                onChange={(e) => {
                  const currentArticle = { ...this.state.currentArticle };
                  currentArticle.subHead = e.target.value;
                  this.setState({ currentArticle });
                }}
                placeholder='Sub Header'
              />
            </Form.Group>

            <Form.Label>Content</Form.Label>
            <ReactQuill
              modules={Stories.modules}
              id='content'
              value={content}
              formats={Stories.formats}
              ref={this.editor}
              theme='bubble'
              onChange={(html) => {
                const { currentArticle } = this.state;
                currentArticle.content = html;
                this.setState({ currentArticle });
              }}
              placeholder='Tell your story...'
            />

            <Form.Group>
              <Form.Label>Cover</Form.Label>
              <Form.Control
                type='text'
                value={cover}
                onChange={(e) => {
                  const currentArticle = { ...this.state.currentArticle };
                  currentArticle.cover = e.target.value;
                }}
                placeholder='Cover link e.g : https://picsum.photos/800'
              />
            </Form.Group>
            <Button variant='success' type='submit' className='post-btn'>
              Update Post
            </Button>
          </Form>
        )}
        {articles.length > 0 ? (
          <div>
            <h3>Your Articles</h3>
            <Container>
              {articles.map((article, i) => (
                <Row key={i} className=' border-bottom m-2 pb-3 hover' style={{ height: "150px", overflowX: "hidden" }}>
                  <Col sm={1} className='d-none d-md-block'>
                    {i + 1}
                  </Col>
                  <Col xs={8} sm={2}>
                    {" "}
                    <Link to={"/read/" + article._id}>
                      <b>{article.headLine} </b>{" "}
                    </Link>
                  </Col>
                  <Col xs={8} sm={2}>
                    {article.subHead || ""}
                  </Col>
                  <Col sm={2} className='d-none d-md-block'>
                    {article.category.name}
                  </Col>
                  <Col xs={12} sm={3}>
                    {article.content.includes("</") ? <div dangerouslySetInnerHTML={{ __html: article.content }}></div> : article.content}
                  </Col>
                  <Col xs={4} sm={2} className='d-flex'>
                    <Button
                      variant='outline-warning'
                      className='text-nowrap mr-3'
                      onClick={() => {
                        this.setState({ currentArticle: article });
                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                    >
                      Edit Post
                    </Button>
                    <Button variant='outline-danger' className='text-nowrap' onClick={() => this.setState({ currentArticle: article, confirm: true })}>
                      Delete Post
                    </Button>
                  </Col>
                </Row>
              ))}
            </Container>
          </div>
        ) : (
          <div>
            <b>No articles Posted yet!</b>{" "}
            <Link to='/new-story'>
              <div>Post your first Article</div>
            </Link>
          </div>
        )}
        {
          <Modal show={confirm} onHide={() => this.setState({ confirm: false })}>
            <Modal.Header closeButton>
              <Modal.Title>Delete Article</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to delete this article?</Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={() => this.setState({ confirm: false })}>
                No
              </Button>
              <Button
                variant='danger'
                onClick={() => {
                  this.setState({ confirm: false });
                  this.deleteArticle();
                }}
              >
                Yes
              </Button>
            </Modal.Footer>
          </Modal>
        }
      </Container>
    );
  }
}

Stories.modules = {
  toolbar: [[{ header: "1" }, { header: "2" }], ["bold", "italic", "blockquote"], [{ align: "" }, { align: "center" }, { align: "right" }, { align: "justify" }], ["link", "image"], ["clean"]],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};
/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
Stories.formats = ["header", "bold", "italic", "blockquote", "align", "link", "image"];
