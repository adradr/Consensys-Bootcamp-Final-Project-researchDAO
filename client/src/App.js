import React, { Component } from "react";
import researchDAO from "./contracts/researchDAO.json";
import getWeb3 from "./utils/getWeb3";



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
      <li key={item.indexOf()}>{item}</li>
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

      this.proposalItems = this.state.proposalQueue.map((item, key) =>
      <li key={item.proposalIndex}>#{item.proposalIndex}: {item.title}, {item.proposalApplicant}, {item.documentationAddress}</li>
      );


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
      <div className="App">
        <center>

        <h1>Welcome to researchDAO!</h1>
        <p>Contract is deployed at address: {this.state.address}</p>

        <h2>Members of the DAO</h2>
        {this.memberItems}


        <h2>Submitted proposals</h2>
        {this.proposalItems}

        <h2>Submit proposal</h2>
        <form onSubmit={this.handleSubmitProposal}>
        <br /><label>
            Proposal for research or Application
            <br />
            (proposal if checked, application if unchecked):
            <input type="text" name="proposalOrApplication" id="proposalOrApplication" onChange={this.handleChange}/>
          </label>
          <br /><label>
            Proposal title:
            <input type="text" name="proposalTitle" id="proposalTitle" onChange={this.handleChange} />
          </label>
          <br /><label>
            Proposal applicant address (0x01234..):
            <input type="text" name="proposalApplicantAddress" id="proposalApplicantAddress" onChange={this.handleChange}/>
          </label>
          <br /><label>
            Proposal documentation address (IPFS hash):
            <input type="text" name="proposalDocumentationHash" id="proposalDocumentationHash" onChange={this.handleChange}/>
          </label>
          <br /><label>
            Proposal funding goal in ETH:
            <input type="number" name="proposalFundingGoal" onChange={this.handleChange}/>
          </label>
          <br /><label>
            Proposal shares requested:
            <input type="number" name="proposalSharesRequested" id="proposalSharesRequested" onChange={this.handleChange}/>
          </label>
          <br />
          <br />
          <input type="submit" value="Submit proposal" />
        </form>

        <h2>Confirm application proposal</h2>

        <form onSubmit={this.handleSubmitConfirmation}>
          <br /><label>
            Proposal index #:
            <input type="number" name="proposalIndexToConfirm" id="proposalIndexToConfirm" onChange={this.handleChange} />
          </label>
          <br /><label>
            Confirm (true/false)
            <input type="text" name="proposalConfirmValue" id="proposalConfirmValue" onChange={this.handleChange}/>
          </label>
          <br /><label>
            Application contribution
            <input type="text" name="proposalContribution" id="proposalContribution" onChange={this.handleChange}/>
          </label>
          <br />
          <br />
          <input type="submit" value="Submit confirmation" />
        </form>



        <h2>Vote on proposal</h2>

        <form onSubmit={this.handleSubmitVote}>
          <br /><label>
            Proposal index #:
            <input type="number" name="proposalIndexToVote" id="proposalIndexToVote" onChange={this.handleChange} />
          </label>
          <br /><label>
            Vote (Yes - 1; No - 2)
            <input type="number" name="proposalVote" id="proposalVote" onChange={this.handleChange}/>
          </label>
          <br />
          <br />
          <input type="submit" value="Submit vote" />
        </form>

        <h2>Process proposal</h2>

        <form onSubmit={this.handleProcess}>
          <br /><label>
            Proposal index #:
            <input type="number" name="proposalIndexToProcess" id="proposalIndexToProcess" onChange={this.handleChange} />
          </label>
          <br />
          <br />
          <input type="submit" value="Submit process" />
        </form>
        </center>
        <br />
        <br />
      </div>
    );
  }
}

export default App;
