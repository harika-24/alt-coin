'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

  /**
   * The Init method is called when the Smart Contract 'certverif' is instantiated by the
   * blockchain network. Best practice is to have any Ledger initialization in separate
   * function -- see initLedger()
   */
  async Init(stub) {
    console.info('=========== Instantiated fabcar chaincode ===========');
    return shim.success();
  }
  /**
   * The Invoke method is called as a result of an application request to run the
   * Smart Contract 'carauction'. The calling application program has also specified
   * the particular smart contract function to be called, with arguments
   */
  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.info(err);
      return shim.error(err);
    }
  }

  /**
   * The initLedger method is called as a result of instantiating chaincode.
   * It can be thought of as a constructor for the network. For this network
   * we will create 3 members, a vehicle, and a vehicle listing.
   */
  async initLedger(stub, args) {
    console.info('============= START : Initialize Ledger ===========');

    let inst1 = {};
    inst1.name = 'Vellore Institute of Technology';
    inst1.nodeId = '40550ad9-eb04-4313-8192-ce721eb7d362';
    inst1.url = 'https://vit.ac.in';
    inst1.signingAuthority = 'Mr. Mohanram, Dean Academics';

    let inst2 = {};
    inst2.name = 'Manipal Academy of higher Education';
    inst2.nodeId = 'e9795b7-c511-48c9-bcac-dd325cad5b28';
    inst2.url = 'https://manipal.edu';
    inst2.signingAuthority = 'Narayana Sabhahit ,Registrar';


    let cert1 = {};
    cert1.receipient = 'Akshay Gugale';
    cert1.regno = '16BCE2147';
    cert1.cgpa = '8.8';
    cert1.type = 'Bachelor of Technology';
    cert1.branch = 'Computer Science and Engineering';
    cert1.enrollmentYear = 2016;
    cert1.graduationYear = 2020;
    cert1.status = 'OK';
    cert1.issuer = 'altcoinadmin@vit.ac.in'; // foreign key of institute

    let cert2 = {};
    cert2.receipient = 'Sruthi';
    cert2.regno = '21135679';
    cert2.cgpa = '9.13';
    cert2.type = 'Bachelor of Technology';
    cert2.branch = 'Electronic and communication engineering';
    cert2.enrollmentYear = 2015;
    cert2.graduationYear = 2019;
    cert2.status = 'OK';
    cert2.issuer = 'altcoinadmin@manipal.edu'; // foreign key of institute

    let cert3 = {};
    cert3.receipient = 'sindhu';
    cert3.regno = '17BME0059';
    cert3.cgpa = '7.8';
    cert3.type = 'Bachelor of Technology';
    cert3.branch = 'Mechanical Engineering';
    cert3.enrollmentYear = 2017;
    cert3.graduationYear = 2021;
    cert3.status = 'OK';
    cert3.issuer = 'altcoinadmin@vit.ac.in'; // foreign key of institute


    await stub.putState('altcoinadmin@vit.ac.in', Buffer.from(JSON.stringify(inst1)));
    await stub.putState('altcoinadmin@manipal.edu', Buffer.from(JSON.stringify(inst2)));
    await stub.putState('cert_9e0d4a9bc4665522a5a7558fcf48d325663d74c2deed2322b84f45e097121b58', Buffer.from(JSON.stringify(cert1)));
    await stub.putState('cert_4d329d4dd7816e256ee29f8bbd2f0e8c367bab0da59611e5949c3fb646189f7d', Buffer.from(JSON.stringify(cert2)));
    await stub.putState('cert_bd611e47e0fdd5af009bf263a1fe878ee450dbb01c752a3cac6aa01f1cd080bc', Buffer.from(JSON.stringify(cert3)));

    console.info('============= END : Initialize Ledger ===========');
  }

  /**
   * Query the state of the blockchain by passing in a key
   * @param arg[0] - key to query
   * @return value of the key if it exists, else return an error
   */
  async query(stub, args) {
    console.info('============= START : Query method ===========');
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1');
    }

    let query = args[0];

    let queryAsBytes = await stub.getState(query); //get the cert from chaincode state
    if (!queryAsBytes || queryAsBytes.toString().length <= 0) {
      throw new Error('key' + ' does not exist: ');
    }
    console.info('query response: ');
    console.info(queryAsBytes.toString());
    console.info('============= END : Query method ===========');

    return queryAsBytes;

  }

  /**
   * Create a institute object in the state
   * @param arg[0] - key for the institute (altcoin admin for institute email)
   * @param arg[1] - Institute name
   * @param arg[2] - node Id (uuid of nodes)
   * @param arg[3] - website url - https://vit.ac.in
   * @param arg[4] - signing authority - Dean, Chancellor
   **/
  async createInstitute(stub, args) {
    console.info('============= START : Create Institute ===========');
    if (args.length != 5) {
      throw new Error('Incorrect number of arguments. Expecting 5');
    }

    var institute = {
      name: args[1],
      nodeId: args[2],
      url: args[3],
      signingAuthority: args[4]
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(institute)));
    console.info('============= END : Create Institiute ===========');
  }

  /**
   * Create a offer object in the state, and add it to the array of offers for that listing
   * @param arg[1] - receipient = "Akshay Gugale";
   * @param arg[2] - regno = "16BCE2147";
   * @param arg[3] - cgpa = "8.8";
   * @param arg[4] - type = "Bachelor of Technology";
   * @param arg[5] - branch = "Computer Science and Engineering";
   * @param arg[6] - enrollmentYear = 2016;
   * @param arg[7] - graduationYear = 2020;
   * @param arg[8] - issuer = "altcoinadmin@vit.ac.in";
   * @param arg[9] - status = "OK";
   * onSuccess - create and update the state with a certificate
   */
  async addCert(stub, args) {
    console.info('============= START : Add Certificate ===========');
    if (args.length != 10) {
      throw new Error('Incorrect number of arguments. Expecting 10');
    }

    var cert = {
      receipient: args[1],
      regno: args[2],
      cgpa: args[3],
      type: args[4],
      branch: args[5],
      enrollmentYear: args[6],
      graduationYear: args[7],
      issuer: args[8],
      status: args[9]
    };

    let inst = args[8];
    console.info('Institute email: ' + inst);

    //get reference to inst, to add the cert after verification
    let instAsBytes = await stub.getState(inst);
    if (!instAsBytes || instAsBytes.toString().length <= 0) {
      throw new Error('inst does not exist');
    }
    inst = JSON.parse(instAsBytes);

    console.info('Certificate response before pushing to offers: ');
    console.info(cert);

    //update the listing - use listingId as key(args[1]), and listing object as value
    await stub.putState(args[0], Buffer.from(JSON.stringify(cert)));

    console.info('============= END : addCert method ===========');
  }

  /**
   * Close the bidding for a vehicle listing and choose the
   * highest bid as the winner.
   * @param arg[0] - listingId - a reference to our vehicleListing
   * onSuccess - changes the ownership of the car on the auction from the original
   * owner to the highest bidder. Subtracts the bid price from the highest bidder
   * and credits the account of the seller. Updates the state to include the new
   * owner and the resulting balances.
   */
  // async closeBidding(stub, args) {
  //   console.info('============= START : Close bidding ===========');
  //   if (args.length != 1) {
  //     throw new Error('Incorrect number of arguments. Expecting 1');
  //   }

  //   let listingKey = args[0];

  //   //check if listing exists
  //   let listingAsBytes = await stub.getState(listingKey);
  //   if (!listingAsBytes || listingAsBytes.toString().length <= 0) {
  //     throw new Error('listing does not exist: ');
  //   }
  //   console.info('============= listing exists ===========');

  //   var listing = JSON.parse(listingAsBytes);
  //   console.info('listing: ');
  //   console.info(util.inspect(listing, { showHidden: false, depth: null }));
  //   listing.listingState = 'RESERVE_NOT_MET';
  //   let highestOffer = null;

  //   //can only close bidding if there are offers
  //   if (listing.offers && listing.offers.length > 0) {

  //     //use built in JavaScript array sort method - returns highest value at the first index - i.e. highest bid
  //     listing.offers.sort(function (a, b) {
  //       return (b.bidPrice - a.bidPrice);
  //     });

  //     //get a reference to our highest offer - this object includes the bid price as one of its fields
  //     highestOffer = listing.offers[0];
  //     console.info('highest Offer: ' + highestOffer);

  //     //bid must be higher than reserve price, otherwise we can not sell the car
  //     if (highestOffer.bidPrice >= listing.reservePrice) {
  //       let buyer = highestOffer.member;

  //       console.info('highestOffer.member: ' + buyer);

  //       //get the buyer i.e. the highest bidder on the vehicle
  //       let buyerAsBytes = await stub.getState(buyer);
  //       if (!buyerAsBytes || buyerAsBytes.toString().length <= 0) {
  //         throw new Error('vehicle does not exist: ');
  //       }

  //       //save a reference of the buyer for later - need this reference to update account balance
  //       buyer = JSON.parse(buyerAsBytes);
  //       console.info('buyer: ');
  //       console.info(util.inspect(buyer, { showHidden: false, depth: null }));

  //       //get reference to vehicle so we can get the owner i.e. the seller
  //       let vehicleAsBytes = await stub.getState(listing.vehicle);
  //       if (!vehicleAsBytes || vehicleAsBytes.toString().length <= 0) {
  //         throw new Error('vehicle does not exist: ');
  //       }

  //       //now that we have the reference to the vehicle object,
  //       //we can find the owner of the vehicle bc the vehicle object has a field for owner
  //       var vehicle = JSON.parse(vehicleAsBytes);

  //       //get reference to the owner of the vehicle i.e. the seller
  //       let sellerAsBytes = await stub.getState(vehicle.owner);
  //       if (!sellerAsBytes || sellerAsBytes.toString().length <= 0) {
  //         throw new Error('vehicle does not exist: ');
  //       }

  //       //the seller is the current vehicle owner
  //       let seller = JSON.parse(sellerAsBytes);

  //       console.info('seller: ');
  //       console.info(util.inspect(seller, { showHidden: false, depth: null }));

  //       console.info('#### seller balance before: ' + seller.balance);

  //       //ensure all strings get converted to ints
  //       let sellerBalance = parseInt(seller.balance, 10);
  //       let highOfferBidPrice = parseInt(highestOffer.bidPrice, 10);
  //       let buyerBalance = parseInt(buyer.balance, 10);

  //       //increase balance of seller
  //       sellerBalance += highOfferBidPrice;
  //       seller.balance = sellerBalance;

  //       console.info('#### seller balance after: ' + seller.balance);
  //       console.info('#### buyer balance before: ' + buyerBalance);

  //       //decrease balance of buyer by the amount of the bid price
  //       buyerBalance -= highestOffer.bidPrice;
  //       buyer.balance = buyerBalance;

  //       console.info('#### buyer balance after: ' + buyerBalance);
  //       console.info('#### buyer balance after: ' + buyerBalance);
  //       console.info('#### vehicle owner before: ' + vehicle.owner);

  //       //need reference to old owner so we can update their balance later
  //       let oldOwner = vehicle.owner;

  //       //assign person with highest bid as new owner
  //       vehicle.owner = highestOffer.member;

  //       console.info('#### vehicle owner after: ' + vehicle.owner);
  //       console.info('#### buyer balance after: ' + buyerBalance);
  //       listing.offers = null;
  //       listing.listingState = 'SOLD';

  //       //update the balance of the buyer
  //       await stub.putState(highestOffer.member, Buffer.from(JSON.stringify(buyer)));

  //       console.info('old owner: ');
  //       console.info(util.inspect(oldOwner, { showHidden: false, depth: null }));

  //       //update the balance of the seller i.e. old owner
  //       await stub.putState(oldOwner, Buffer.from(JSON.stringify(seller)));

  //       //update the listing, use listingId as key, and the listing object as the value
  //       await stub.putState(listingKey, Buffer.from(JSON.stringify(listing)));
  //     }
  //   }
  //   console.info('inspecting vehicle: ');
  //   console.info(util.inspect(vehicle, { showHidden: false, depth: null }));

  //   if (highestOffer) {
  //     //update the owner of the vehicle
  //     await stub.putState(listing.vehicle, Buffer.from(JSON.stringify(vehicle)));
  //   } else { throw new Error('offers do not exist: '); }

  //   console.info('============= END : closeBidding ===========');
  // }
};

shim.start(new Chaincode());