const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {peeps: []};
    }

    componentDiMount() {
        client({method: 'GET', path: '/api/peeps'}).done(response => {
            this.setState({peeps: response.entity._embedded.peeps});
        });
    }

    render() {
        return (
            <PeepList peeps={this.state.peeps}/>
        )
    }
}

class PeepList extends React.Component{
    render() {
        var peeps = this.props.peeps.map(peeps =>
            <Peep key={peep._links.self.href} peep={peep}/>
        );
        return (
            <table>
                <tbody>
                    <tr>
                        <th>Peep</th>
                    </tr>
                    {peeps}
                </tbody>
            </table>
        )
    }
}

class Peep extends React.Component{
    render() {
        return (
            <tr>
                <td>{this.props.peep.content}</td>
            <tr>
        )
    }
}

ReactDOM.render(
    <App />
    document.getElementById('react')
)
