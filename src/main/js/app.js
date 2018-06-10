const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');

const when = require('when');
const follow = require('./follow'); // function to hop multiple links by "rel"
const stompClient = require('./websocket-listener');

class App extends React.Component {

var root = '/api';

	constructor(props) {
		super(props);
		this.state = {peeps: [], attributes: [], page: 1, pageSize: 2, links: {}};
		this.updatePageSize = this.updatePageSize.bind(this);
        this.onCreate = this.onCreate.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onNavigate = this.onNavigate.bind(this);
        this.refreshCurrentPage = this.refreshCurrentPage.bind(this);
        this.refreshAndGoToLastPage = this.refreshAndGoToLastPage.bind(this);
	}

	componentDidMount() {
    	this.loadFromServer(this.state.pageSize);
    }

    loadFromServer(pageSize) {
    	follow(client, root, [
    		{rel: 'peeps', params: {size: pageSize}}]
    	).then(peepCollection => {
    		return client({
    			method: 'GET',
    			path: peepCollection.entity._links.profile.href,
    			headers: {'Accept': 'application/schema+json'}
    		}).then(schema => {
    			this.schema = schema.entity;
    			return peepCollection;
    		});
    	}).done(peepCollection => {
    		this.setState({
    			peeps: peepCollection.entity._embedded.peeps,
    			attributes: Object.keys(this.schema.properties),
    			pageSize: pageSize,
    			links: peepCollection.entity._links});
    	});
    }

    onCreate(newPeep) {
    	follow(client, root, ['peeps']).then(peepCollection => {
    		return client({
    			method: 'POST',
    			path: peepCollection.entity._links.self.href,
    			entity: newPeep,
    			headers: {'Content-Type': 'application/json'}
    		})
    	}).then(response => {
    		return follow(client, root, [
    			{rel: 'peeps', params: {'size': this.state.pageSize}}]);
    	}).done(response => {
    		if (typeof response.entity._links.last != "undefined") {
    			this.onNavigate(response.entity._links.last.href);
    		} else {
    			this.onNavigate(response.entity._links.self.href);
    		}
    	});
    }

    onDelete(peep) {
    	client({method: 'DELETE', path: peep._links.self.href}).done(response => {
    		this.loadFromServer(this.state.pageSize);
    	});
    }

    onNavigate(navUri) {
    	client({method: 'GET', path: navUri}).done(peepCollection => {
    		this.setState({
    			peeps: peepCollection.entity._embedded.peeps,
    			attributes: this.state.attributes,
    			pageSize: this.state.pageSize,
    			links: peepCollection.entity._links
    		});
    	});
    }

    updatePageSize(pageSize) {
    	if (pageSize !== this.state.pageSize) {
    		this.loadFromServer(pageSize);
    	}
    }

//	componentDidMount() {
//		client({method: 'GET', path: '/api/peeps'}).done(response => {
//			this.setState({peeps: response.entity._embedded.peeps});
//		});
//	}

	render() {
		return (
			<PeepList peeps={this.state.peeps}/>
		)
	}
}

class CreateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		var newPeep = {};
		this.props.attributes.forEach(attribute => {
			newPeep[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onCreate(newPeep);

		// clear out the dialog's inputs
		this.props.attributes.forEach(attribute => {
			ReactDOM.findDOMNode(this.refs[attribute]).value = '';
		});

		// Navigate away from the dialog to hide it.
		window.location = "#";
	}

	render() {
		var inputs = this.props.attributes.map(attribute =>
			<p key={attribute}>
				<input type="text" placeholder={attribute} ref={attribute} className="field" />
			</p>
		);

		return (
			<div>
				<a href="#createPeep">Create</a>

				<div id="createPeep" className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Create new peep</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Create</button>
						</form>
					</div>
				</div>
			</div>
		)
	}

}

class PeepList extends React.Component{

    constructor(props) {
        super(props);
        this.handleNavFirst = this.handleNavFirst.bind(this);
        this.handleNavPrev = this.handleNavPrev.bind(this);
        this.handleNavNext = this.handleNavNext.bind(this);
        this.handleNavLast = this.handleNavLast.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    handleInput(e) {
    	e.preventDefault();
    	var pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
    	if (/^[0-9]+$/.test(pageSize)) {
    		this.props.updatePageSize(pageSize);
    	} else {
    		ReactDOM.findDOMNode(this.refs.pageSize).value =
    			pageSize.substring(0, pageSize.length - 1);
    	}
    }

    handleNavFirst(e){
    	e.preventDefault();
    	this.props.onNavigate(this.props.links.first.href);
    }

    handleNavPrev(e) {
    	e.preventDefault();
    	this.props.onNavigate(this.props.links.prev.href);
    }

    handleNavNext(e) {
    	e.preventDefault();
    	this.props.onNavigate(this.props.links.next.href);
    }

    handleNavLast(e) {
    	e.preventDefault();
    	this.props.onNavigate(this.props.links.last.href);
    }

    render() {
    	var peeps = this.props.peeps.map(peep =>
    		<Peep key={peep._links.self.href} peep={peep} onDelete={this.props.onDelete}/>
    	);

    	var navLinks = [];
    	if ("first" in this.props.links) {
    		navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
    	}
    	if ("prev" in this.props.links) {
    		navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
    	}
    	if ("next" in this.props.links) {
    		navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
    	}
    	if ("last" in this.props.links) {
    		navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
    	}

    	return (
    		<div>
    			<input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
    			<table>
    				<tbody>
    					<tr>
    						<th>Content</th>
    						<th></th>
    					</tr>
    					{peeps}
    				</tbody>
    			</table>
    			<div>
    				{navLinks}
    			</div>
    		</div>
    	)
    }

//	render() {
//		var peeps = this.props.peeps.map(peep =>
//			<Peep key={peep._links.self.href} peep={peep}/>
//		);
//		return (
//			<table>
//				<tbody>
//					<tr>
//						<th>Peep</th>
//					</tr>
//					{peeps}
//				</tbody>
//			</table>
//		)
//	}
}

class Peep extends React.Component {

	constructor(props) {
		super(props);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleDelete() {
		this.props.onDelete(this.props.peep);
	}

	render() {
		return (
			<tr>
				<td>{this.props.peep.content}</td>
				<td>
					<button onClick={this.handleDelete}>Delete</button>
				</td>
			</tr>
		)
	}
}


//class Peep extends React.Component{
//	render() {
//		return (
//			<tr>
//				<td>{this.props.peep.content}</td>
//			</tr>
//		)
//	}
//}

ReactDOM.render(
	<App />,
	document.getElementById('react')
)