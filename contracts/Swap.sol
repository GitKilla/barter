pragma solidity ^0.6.0;

import "../openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

contract Swap {

    address payable public owner;
    uint public offerCount;
    bool public stopped = false;
    uint public fee;

    struct TradeOffer {
        address payable offerer;
        address payable asker;
        uint[] offer;
        uint[] ask;
        address[] offerContract;
        address[] askContract;
        uint offerLength;
        uint askLength;
        uint offerVal;
        uint askVal;
        uint feePaid;
        State state;
    }

    enum State {Active, Closed}
    mapping(address => bool) public approvedERC721;
    mapping(uint => TradeOffer) public offers;
    mapping(address => uint[]) public offersByAddress; 
    mapping(address => uint) public offerCountByAddress;
    mapping(address => uint[]) public offersCreatedByAddress; 
    mapping(address => uint) public offersCreatedCountByAddress;

    event LogOfferAdded(uint offerAddedId, address indexed userAdded);
    event LogOfferAccepted(uint offerAcceptedId, address indexed userAccepted);
    event LogOfferCanceled(uint offerCanceledId, address indexed userCanceled);
    event LogNFTApproval(address contractAddressApproved);
    event LogNFTRemoval(address contractAddressRemoved);
    event LogFeeChange(uint fee);

    modifier onlyOwner (address _address) {require(_address == owner); _;}
    modifier stopInEmergency {require(!stopped); _;}
    modifier onlyInEmergency {require(stopped); _;}

    constructor() public {
       owner = msg.sender;
       offerCount = 0;
       fee = 0;
    }

    /// @dev Sets the fee in wei to be levied on each accept and offer creation.
    /// @param _fee is fee in wei.
    function setFee(uint _fee) public onlyOwner(msg.sender) {
        emit LogFeeChange(_fee);
        fee = _fee;
    }

    /// @dev Whitelists an NFT address for inclusion in offers.
    /// @param _NFTContract is the nft contract's address.
    function approveNFT(address _NFTContract) public onlyOwner(msg.sender) {
        emit LogNFTApproval(_NFTContract);
        approvedERC721[_NFTContract] = true;
    }

    /// @dev removes whitelisting of an NFT address.
    /// @param _NFTContract is the nft contract's address.
    function removeNFT(address _NFTContract) public onlyOwner(msg.sender) {
        emit LogNFTRemoval(_NFTContract);
        approvedERC721[_NFTContract] = false;
    }

    /// @dev Sets circuit breaker value.
    /// @param _stopped Circuit breaker, true to pause contract and false to resume.
    function setStopped(bool _stopped) public onlyOwner(msg.sender) {
        stopped = _stopped;
    }

    /// @dev Creates an NFT trade offer in the Swap 'order book'.
    /// @param _offer NFT ids of user offering to give away.
    /// @param _offerContract contract addresses pertaining to the NFT ids in _offer.
    /// @param _ask NFT ids that the user is asking to receive.
    /// @param _askContract contract addresses pertaining to the NFT ids in _ask.
    /// @param _offerVal Wei that user is including with their offer.
    /// @param _askVal Wei that user is asking for in return.
    /// @param _targetAddress address that user is attempting to trade with.
    /// @return true if successful
    function addOffer(uint[] memory _offer, address[] memory _offerContract
                    , uint[] memory _ask, address[] memory _askContract
                    , uint _offerVal, uint _askVal, address payable _targetAddress) 
                    public payable stopInEmergency() returns (bool) {

        require(_offer.length >= 1 || _ask.length >= 1, "Offer must include at least one NFT");
        require(_offer.length == _offerContract.length, "NFT IDs (offer) array must be the same size as the contract array");
        require(_ask.length == _askContract.length, "NFT IDs (ask) array must be the same size as the contract array");
        require((_offerVal+fee) == msg.value, "Must include ETH to match offered ETH amount plus fee");
        for(uint i = 0; i < _offer.length; i++) {
            ERC721 con = ERC721(_offerContract[i]);
            require(approvedERC721[_offerContract[i]], "One or more offered NFTs are not whitelisted NFT types");
            require(con.ownerOf(_offer[i]) == msg.sender, "Offerer does not own NFT");
            require(con.isApprovedForAll(msg.sender, address(this)), "Offerer has not approved the contract to send NFTs");
        }

        for(uint i = 0; i < _ask.length; i++) {
            require(approvedERC721[_askContract[i]], "One or more asked NFTs are not whitelisted NFT types");
        }

        emit LogOfferAdded(offerCount, msg.sender);
        offersByAddress[_targetAddress].push(offerCount);
        offerCountByAddress[_targetAddress] = offerCountByAddress[_targetAddress]+1;
        offersCreatedByAddress[msg.sender].push(offerCount);
        offersCreatedCountByAddress[msg.sender] = offersCreatedCountByAddress[msg.sender]+1;
        offers[offerCount] = TradeOffer({offerer: msg.sender
            , asker: _targetAddress
            , offer: _offer
            , offerContract:_offerContract
            , ask: _ask
            , askContract:_askContract
            , offerLength:_offer.length
            , askLength:_ask.length
            , offerVal: _offerVal
            , askVal:_askVal
            , feePaid:fee
            , state: State.Active});
        offerCount = offerCount + 1;
        
        return true;
    }

    /// @dev Accepts and executes an already existing offer in the 'order book'.
    /// @param _offerId uint ID of the offer that the user wants to accept.
    function acceptOffer(uint _offerId) public payable stopInEmergency() returns (bool) {
        require(offers[_offerId].offerer != 0x0000000000000000000000000000000000000000, "Offerer must not be the burn address");
        require(offers[_offerId].state == State.Active, "Offer must be active");
        offers[_offerId].state = State.Closed; 
        require(offers[_offerId].asker == msg.sender, "Offer can only be accepted by intended recipient");
        require((offers[_offerId].askVal+fee) == msg.value, "Must include required ETH amount for offer and fee");
        
        for(uint i = 0; i < offers[_offerId].ask.length; i++) {
            ERC721 con = ERC721(offers[_offerId].askContract[i]);
            require(con.ownerOf(offers[_offerId].ask[i]) == msg.sender, "User attempting to accept offer without owning the NFTs");
            require(con.isApprovedForAll(msg.sender, address(this)), "User accepting offer has not approved the contract to send NFTs");
            con.safeTransferFrom(msg.sender, offers[_offerId].offerer, offers[_offerId].ask[i]);
        }
        for(uint i = 0; i < offers[_offerId].offer.length; i++) {
            ERC721 con = ERC721(offers[_offerId].offerContract[i]); 
            require(con.ownerOf(offers[_offerId].offer[i]) == offers[_offerId].offerer, "User attempting to accept offer that offerer cannot fulfill");
            require(con.isApprovedForAll(offers[_offerId].offerer, address(this)), "Original offerer no longer has transfer enabled for this NFT contract");
            con.safeTransferFrom(offers[_offerId].offerer, msg.sender, offers[_offerId].offer[i]);
        }

        if(offers[_offerId].offerVal > 0) {
            offers[_offerId].asker.transfer(offers[_offerId].offerVal);
        }

        if(offers[_offerId].askVal > 0) {
            offers[_offerId].offerer.transfer(msg.value);
        }

        owner.transfer(fee+offers[_offerId].feePaid);

        emit LogOfferAccepted(_offerId, msg.sender);
    }

    /// @dev Cancels an offer by setting the state to Closed.
    /// @param _offerId uint ID of the offer that the user wants to cancel.
    function cancelOffer(uint _offerId) public stopInEmergency() returns (bool) {
        require(offers[_offerId].offerer == msg.sender || offers[_offerId].asker == msg.sender, "Only the offerer can cancel an offer");
        require(offers[_offerId].state == State.Active, "This offer is already closed");
        offers[_offerId].state = State.Closed;
        offers[_offerId].offerer.transfer(offers[_offerId].offerVal+offers[_offerId].feePaid);
        emit LogOfferCanceled(_offerId, msg.sender);
    }

    /// @dev returns NFT ID within an offer's offer array given offer ID and array index.
    /// @param _offerId uint ID of the offer user is querying.
    /// @param index array index of offerId being queried.
    /// @return NFT ID within offer array.
    function getOfferFromOffer(uint _offerId, uint _index) public view returns (uint) {
        TradeOffer memory off = offers[_offerId];
        return off.offer[_index];
    }

    /// @dev returns NFT ID within an offer's ask array given offer ID and array index.
    /// @param _offerId uint ID of the offer user is querying.
    /// @param index array index of offerId being queried.
    /// @return NFT ID within ask array.
    function getOfferFromAsk(uint _offerId, uint _index) public view returns (uint) {
        TradeOffer memory off = offers[_offerId];
        return off.ask[_index];
    }

    /// @dev returns number of NFTs in an Offers offer.
    /// @param _offerId uint ID of the offer user is querying.
    /// @return length of offer array in an offer.
    function getOfferLengthFromOffer(uint _offerId) public view returns (uint) {
        TradeOffer memory off = offers[_offerId];
        return off.offerLength;
    }

    /// @dev returns number of NFTs in an Offers ask.
    /// @param _offerId uint ID of the offer user is querying.
    /// @return length of ask array in an offer.
    function getOfferLengthFromAsk(uint _offerId) public view returns (uint) {
        TradeOffer memory off = offers[_offerId];
        return off.askLength;
    }

    /// @dev returns NFT Contract address within an offer's offer array given offer ID and array index.
    /// @param _offerId uint ID of the offer user is querying.
    /// @param index array index of offerId being queried.
    /// @return NFT Contract address within offer array.
    function getContractFromOffer(uint _offerId, uint _index) public view returns (address) {
        TradeOffer memory off = offers[_offerId];
        return off.offerContract[_index];
    }

    /// @dev returns NFT Contract address within an offer's ask array given offer ID and array index.
    /// @param _offerId uint ID of the offer user is querying.
    /// @param index array index of offerId being queried.
    /// @return NFT Contract address within ask array.
    function getContractFromAsk(uint _offerId, uint _index) public view returns (address) {
        TradeOffer memory off = offers[_offerId];
        return off.askContract[_index];
    }

    /// @dev returns true or false (corresponding to whether offer is active or not) given an offer ID.
    /// @param _offerId uint ID of the offer user is querying.
    /// @return true if active and acceptable, false if closed
    function getOfferState(uint _offerId) public view returns (bool) {
        TradeOffer memory off = offers[_offerId];
        if (off.state == State.Active) {
            return true;
        } else {
            return false;
        }
    }

    /// @dev returns eth ask in wei for a given offer.
    /// @param _offerId uint ID of the offer user is querying.
    /// @return eth amount in wei that the user who created the trade is asking for.
    function getOfferAskVal(uint _offerId) public view returns (uint) {
        TradeOffer memory off = offers[_offerId];
        return off.askVal;
    }

    /// @dev returns eth offer in wei for a given offer.
    /// @param _offerId uint ID of the offer user is querying.
    /// @return eth amount in wei that the user who created the trade is offering.
    function getOfferOffVal(uint _offerId) public view returns (uint) {
        TradeOffer memory off = offers[_offerId];
        return off.offerVal;
    }

    /// @dev returns eth fee in wei.
    /// @return eth amount in wei that the contract charges per transaction (accept and offer creation only).
    function getFee() public view returns (uint) {
        return fee;
    }

}