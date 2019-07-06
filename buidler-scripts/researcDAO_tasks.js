// Importing deployment parameters file
const deploymentParams = require('../deployment-params.js')

// Basic example task for checking accounts
task("accounts", "Prints a list of the available accounts", async () => {
    const accounts = await ethereum.send("eth_accounts");
    console.log("Accounts:", accounts);
  });


  task('dao-deploy', 'Deploys a new instance of researchDAO')
  .setAction(async () => {

    // Make sure everything is compiled
    await run('compile')

    console.log('Deploying a new DAO to the network ' + buidlerArguments.network)
    console.log(
      'Deployment parameters:\n',
      //'  token of DAO:', deploymentParams.TOKEN, '\n',        // later used only for external token
      '  voting period:', deploymentParams.VOTING_PERIOD, '\n',
      '  rage quit period:', deploymentParams.RAGEQUIT_PERIOD, '\n',
      '  proposal deposit:', deploymentParams.PROPOSAL_DEPOSIT, '\n',
      '  processing rewards:', deploymentParams.PROCESSING_REWARD, '\n',
      '  shares requested by summoner:', deploymentParams.INITIAL_SUMMONER_SHARES, '\n',
      '  tokens per ETH deposited:', deploymentParams.TOKENS_PER_ETH_DEPOSITED, '\n'
    )

    // Asking if the parameters are correct to proceed to deployment
    const Confirm = require('prompt-confirm')
    const prompt = new Confirm('Please confirm that the deployment parameters are correct')
    const confirmation = await prompt.run()

    if (!confirmation) {
      return
    }

    const rDAO = artifacts.require('researchDAO')

    console.log("Deploying...")

    //const rrdao = new web3.eth.Contract(rDAO_ABI)
    //const rrdao = rDAO.send(deploymentParams.INITIAL_ETH_DEPOSITED_BY_SUMMONER).new(deploymentParams.VOTING_PERIOD);

    const rdao = await rDAO.deployed()

    // const rdao = await rDAO.new(
    //   //deploymentParams.TOKEN,
    //   deploymentParams.VOTING_PERIOD,
    //   deploymentParams.RAGEQUIT_PERIOD,
    //   deploymentParams.PROPOSAL_DEPOSIT,
    //   deploymentParams.PROCESSING_REWARD,
    //   deploymentParams.INITIAL_SUMMONER_SHARES,
    //   deploymentParams.TOKENS_PER_ETH_DEPOSITED
    // )
    //.send(deploymentParams.INITIAL_ETH_DEPOSITED_BY_SUMMONER)

    console.log("")
    console.log("researchDAO deployed. Address:", rdao.address)
    console.log("Set this address in buidler.config.js's networks section to use the other tasks")
  })

