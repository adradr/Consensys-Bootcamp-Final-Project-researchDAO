import React, { Component } from "react";
import researchDAO from "./contracts/researchDAO.json";
import getWeb3 from "./utils/getWeb3";
import Octicon, {Beaker, Person} from '@primer/octicons-react'



class App extends Component {


  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      accounts: null,
      contract: null,
      members: [],
      membersCounter: null,
      proposalQueue: [],
      proposalOrApplication: null,
      proposalApplicantAddress : null,
      proposalTitle : null,
      proposalDocumentationHash : null,
      proposalFundingGoal : null,
      proposalSharesRequested : null,
      proposalCounter: null,
      proposalVote: null,
      proposalIndexToVote: null,
      proposalIndexToConfirm: null,
      proposalConfirmValue: null,
      proposalIndexToProcess: null,
      proposalList: null
    };

    this.handleSubmitProposal = this.handleSubmitProposal.bind(this);
    this.submitProposal = this.submitProposal.bind(this);

    this.handleSubmitConfirmation = this.handleSubmitConfirmation.bind(this);
    this.submitConfirmation = this.submitConfirmation.bind(this);

    this.handleSubmitVote = this.handleSubmitVote.bind(this);
    this.submitVote = this.submitVote.bind(this);

    this.handleProcess = this.handleProcess.bind(this);
    this.submitProcess = this.submitProcess.bind(this);

    this.handleChange = this.handleChange.bind(this)



  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = researchDAO.networks[networkId];
      const instance = new web3.eth.Contract(
        researchDAO.abi,
        deployedNetwork && deployedNetwork.address,
      );
      const address = instance._address
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3: web3, accounts: accounts, contract: instance, address: address });
      console.log("Accounts connected: \n", accounts)

      // Fetching members of the DAO
      var members = await instance.methods.getMembers().call();
      this.setState({members: members})
      console.log("membercount:", this.state.members)
      this.memberItems = this.state.members.map((item, key) =>
      <tr key={item.indexOf()}><td>{key+1}</td><td>{item}</td></tr>
      );

      this.memberItemsheader = this.state.members.map((item, key) =>
        { return key === 0 ?
            <tr key={key}><th>#</th><th>Address</th></tr>
            :
            ""
          }
      );

      // Fetching proposalCounter value to know how much elements to fetch from array
      var proposalCounter = await instance.methods.proposalCounter().call();
      this.setState({proposalCounter: proposalCounter})
      console.log("counter:", proposalCounter)

      // Fetching all proposals and
      // Storing proposals in an array
      var y = []
      var i = 0;
      while (i < proposalCounter) {
        await this.fetchProposals(i)
        y.push(this.state.proposalQueue)
        this.setState({ proposalQueue: y });
        i++;
      }

      // this.proposalItems = this.state.proposalQueue.map((item, key) =>
      // <li key={item.proposalIndex}>#{item.proposalIndex}: {item.title}, Shares: {item.sharesRequested}, Goal: {item.fundingGoal}, Applicant: {item.applicant}</li>
      // );


      function timeConverter(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + '  ' + hour + ':' + min ;
        return time;
      }


      this.proposalItems = this.state.proposalQueue.map((item, key) =>
      <tr key={item.proposalIndex}><td>{key+1}</td><td>{timeConverter(item.creationTimestamp)}</td><td><Octicon icon={item.isProposalOrApplication ? Beaker : Person}/> {item.title}</td><td>{item.isProposalOrApplication ? item.fundingGoal : item.sharesRequested} {item.isProposalOrApplication ? "ETH" : "shares"}</td><td width="30%">{item.applicant}</td></tr>
      );

      this.proposalItemsheader = this.state.proposalQueue.map((item, key) =>
      // <tr key={key}><th>No</th><th>Title</th><th>Shares</th><th>Goal</th><th>Applicant</th></tr>
        {
          return key === 0 ?
            <tr key={key}><th>#</th><th>Timestamp</th><th>Title</th><th>Requested</th><th>Applicant address</th></tr>
            :
            ""

          }
      );

      // this.proposalItemsheader = {<tr><td>Title</td><td>Shares</td><td>Goal</td><td>Applicant</td></tr>}

      // if(this.proposalItems != "") {
      //   this.proposalItems = "<table><thead><tr><td></td><td></td><td></td><td></td></tr></thead><tbody>"+this.proposalItems+"</tbody></table>";
      // }


      if (!this.state.proposalQueue.length){
        this.setState({proposalList: "No submitted proposal yet.."})
      }
      else {
        const list =
        this.state.proposalQueue[0].title

        this.setState({proposalList: list})

      }
      console.log("array:", this.state.proposalQueue)

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value })
    //console.log("event change:",event.target.name, event.target.value)
  }

  fetchProposals = async (proposalIndex) => {
    const { contract } = this.state;
    var proposals = await contract.methods.proposalQueue(proposalIndex).call();
    this.setState({ proposalQueue: proposals });

  };

  fetchMembers = async (memberIndex) => {
    const { contract } = this.state;
    var member = await contract.methods.proposalQueue(memberIndex).call();
    this.setState({ members: member });

  };

  submitProposal = async () => {
    const {
      web3,
      accounts,
      contract,
      proposalOrApplication,
      proposalApplicantAddress,
      proposalTitle,
      proposalDocumentationHash,
      proposalFundingGoal,
      proposalSharesRequested } = this.state;

    // reading globalProposalDeposit from contract
    const deposit = await contract.methods.globalProposalDeposit().call();


    try {
      let submitResponse = await contract.methods.submitProposal(
        JSON.parse(proposalOrApplication),
        proposalApplicantAddress,
        proposalTitle,
        proposalDocumentationHash,
        proposalFundingGoal,
        proposalSharesRequested
      ).send({ from: accounts[0], value:deposit })

      this.setState({ transactionHash: submitResponse });

      console.log("response:", submitResponse);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to submit proposal.`,
      );
      console.error(error);
    }
      // Reload window when submitted
      window.location.reload();
  };

  submitConfirmation = async () => {
    const {
      web3,
      accounts,
      contract,
      proposalIndexToConfirm,
      proposalConfirmValue,
      proposalContribution
      } = this.state;

    try {
      let submitResponse = await contract.methods.confirmApplication(
        proposalIndexToConfirm,
        JSON.parse(proposalConfirmValue)
       ).send({ from: accounts[0], value:this.state.proposalContribution * 1e18 })

      this.setState({ transactionHash: submitResponse });

      console.log("response:", submitResponse);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to submit proposal.`,
      );
      console.error(error);
    }
      // Reload window when submitted
      window.location.reload();
  };

  submitVote = async () => {
    const {
      web3,
      accounts,
      contract,
      proposalVote,
      proposalIndexToVote} = this.state;

    try {
      let submitResponse = await contract.methods.submitVote(
        proposalIndexToVote,
        JSON.parse(proposalVote)
      ).send({ from: accounts[0]})

      this.setState({ transactionHash: submitResponse });

      console.log("response:", submitResponse);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to submit proposal.`,
      );
      console.error(error);
    }
      // Reload window when submitted
      window.location.reload();
  };

  submitProcess = async () => {
    const {
      web3,
      accounts,
      contract,
      proposalIndexToProcess } = this.state;


    try {
      let submitResponse = await contract.methods.processProposal(
        proposalIndexToProcess
      ).send({ from: accounts[0] })

      this.setState({ transactionHash: submitResponse });

      console.log("response:", submitResponse);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to submit proposal.`,
      );
      console.error(error);
    }
      // Reload window when submitted
      //window.location.reload();
  };


  handleSubmitProposal(event) {
    event.preventDefault();

    try {
      var res = this.submitProposal()
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `handleSubmitProposal - Error with function`,
      );
      console.error(error);
    }
    console.log(res)
  }

  handleSubmitConfirmation(event) {
    event.preventDefault();

    try {
      var res = this.submitConfirmation()
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `handleSubmitConfirmation - Error with function`,
      );
      console.error(error);
    }
    console.log(res)
  }

  handleSubmitVote(event) {
    event.preventDefault();

    try {
      var res = this.submitVote()
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `handleSubmitVote - Error with function`,
      );
      console.error(error);
    }
    console.log(res)
  }


  handleProcess(event) {
    event.preventDefault();

    try {
      var res = this.submitProcess()
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `handleProcess - Error with function`,
      );
      console.error(error);
    }
    console.log(res)
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
<div className="App container">
  <center>
    <br />
    <h1 className="text-center">Welcome to researchDAO!</h1>
    <div class="alert alert-primary" role="alert">
      Contract is deployed at address: {this.state.address}
    </div>
    <h2>Members of the DAO</h2>
    <table className="table table-bordered">
      <thead className="thead-light">
        {this.memberItemsheader}
      </thead>
      <tbody>
        {this.memberItems}
      </tbody>
    </table>
    <h2>Submitted proposals</h2>
    <table className="table table-bordered">
      <thead className="thead-light">
        {this.proposalItemsheader}
      </thead>
      <tbody>
        {this.proposalItems}
      </tbody>
    </table>
  </center>
  <div id="accordion">
    <div class="card">
      <div class="card-header" id="headingOne">
        <h5 class="mb-0">
          <button class="btn btn-light" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true"
            aria-controls="collapseOne">
            <strong>
              <h2>Submit Proposal</h2>
            </strong>
          </button>
        </h5>
      </div>
      <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
        <div class="card-body">
          <div className="card mt-3 shadow">
            <div className="card-header text-left">
              <div class="alert alert-danger" role="alert">
                <strong>Please fill out all fields even if not applicable!</strong>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={this.handleSubmitProposal}>
                <div className="form-group">
                  <label>
                    <strong>Proposal for research or Application</strong>
                    <br />
                  </label>
                  <input required type="text" className="form-control" name="proposalOrApplication" id="proposalOrApplication"
                    placeholder="true = research / false = application" onChange={this.handleChange} />
                </div>
                <div className="form-group">
                  <label>
                    <strong>Proposal title</strong>
                  </label>
                  <input required type="text" className="form-control" name="proposalTitle" id="proposalTitle"
                    placeholder="Membership application John Appleseed" onChange={this.handleChange} />
                </div>
                <div className="form-group">
                  <label>
                    <strong>Proposal applicant address</strong>
                  </label>
                  <input required type="text" className="form-control" name="proposalApplicantAddress"
                    id="proposalApplicantAddress" placeholder="0x61eD7f24C14EaD5A605d8B839aab5e1cC445d8D2"
                    onChange={this.handleChange} />
                </div>
                <div className="form-group">
                  <label>
                    <strong>Proposal documentation address - IPFS hash</strong>
                  </label>
                  <input required type="text" className="form-control" name="proposalDocumentationHash"
                    id="proposalDocumentationHash" placeholder="QmWSFBuzLXwcQKudj3ZtWV9kWbFv4KqQZretBhdqSxj4MG"
                    onChange={this.handleChange} />
                </div>
                <div className="form-group">
                  <label>
                    <strong>Proposal funding goal in ETH</strong>
                  </label>
                  <input required type="number" className="form-control" name="proposalFundingGoal" placeholder="10"
                    onChange={this.handleChange} />
                </div>
                <div className="form-group">
                  <label>
                    <strong>Proposal shares requested</strong>
                  </label>
                  <input required type="number" className="form-control" name="proposalSharesRequested" placeholder="10"
                    id="proposalSharesRequested" onChange={this.handleChange} />
                </div>
                <div className="form-group text-center">
                  <input required type="submit" className="btn btn-primary" value="Submit proposal" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header" id="headingTwo">
        <h5 class="mb-0">
          <button class="btn btn-light collapsed" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false"
            aria-controls="collapseTwo">
            <strong>
              <h2>Confirm application</h2>
            </strong>
          </button>
        </h5>
      </div>
      <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordion">
        <div class="card-body">
          <div className="card mt-3 shadow">
            <div className="card-body">
              <form onSubmit={this.handleSubmitConfirmation}>
                <div className="form-group">
                  <label>
                    <strong>Proposal index #</strong>
                  </label>
                  <input required type="number" className="form-control" name="proposalIndexToConfirm"
                    id="proposalIndexToConfirm" placeholder="123" onChange={this.handleChange} />
                </div>
                <div className="form-group">
                  <label>
                    <strong>Confirmation</strong>
                  </label>
                  <input required type="text" className="form-control" name="proposalConfirmValue" id="proposalConfirmValue"
                    placeholder="true/false" onChange={this.handleChange} />
                </div>
                <div className="form-group">
                  <label>
                    <strong>Application contribution</strong>
                  </label>
                  <input required type="text" className="form-control" name="proposalContribution" id="proposalContribution"
                    placeholder="10" onChange={this.handleChange} />
                </div>
                <div className="form-group text-center">
                  <input required type="submit" className="btn btn-primary" value="Confirm proposal" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header" id="headingThree">
        <h5 class="mb-0">
          <button class="btn btn-light collapsed" data-toggle="collapse" data-target="#collapseThree"
            aria-expanded="false" aria-controls="collapseThree">
            <strong>
              <h2>Vote on proposal</h2>
            </strong>
          </button>
        </h5>
      </div>
      <div id="collapseThree" class="collapse" aria-labelledby="headingThree" data-parent="#accordion">
        <div class="card-body">
          <div className="card mt-3 shadow">
            <div className="card-body">
              <form onSubmit={this.handleSubmitVote}>
                <div className="form-group">
                  <label>
                    <strong>Proposal index #</strong>
                  </label>
                  <input required type="number" className="form-control" name="proposalIndexToVote" id="proposalIndexToVote"
                    placeholder="123" onChange={this.handleChange} />
                </div>
                <div className="form-group">
                  <label>
                    <strong>Vote</strong>
                  </label>
                  <input required type="number" className="form-control" name="proposalVote" id="proposalVote"
                    placeholder="Yes = 1 /  No = 2" onChange={this.handleChange} />
                </div>
                <div className="form-group text-center">
                  <input required type="submit" className="btn btn-primary" value="Vote on proposal" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header" id="headingThree">
        <h5 class="mb-0">
          <button class="btn btn-light collapsed" data-toggle="collapse" data-target="#collapseThree"
            aria-expanded="false" aria-controls="collapseThree">
            <strong>
            <h2>Process proposal</h2>
            </strong>
          </button>
        </h5>
      </div>
      <div id="collapseThree" class="collapse" aria-labelledby="headingThree" data-parent="#accordion">
        <div class="card-body">
          <div className="card mt-3 shadow">
            <div className="card-body">
              <form onSubmit={this.handleProcess}>
                <div className="form-group">
                  <label>
                    <strong>Proposal index #</strong>
                  </label>
                  <input required type="number" className="form-control" name="proposalIndexToProcess"
                    id="proposalIndexToProcess" placeholder="420" onChange={this.handleChange} />
                </div>
                <div className="form-group text-center">
                  <input required type="submit" className="btn btn-primary" value="Process proposal" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
 <br />
</div>
    );
  }
}

export default App;
