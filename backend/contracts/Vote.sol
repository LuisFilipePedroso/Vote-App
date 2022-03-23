// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Vote {
    struct Candidate {
        uint16 id;
        string name;
        int16 votes;
    }

    mapping(uint256 => Candidate) candidates;
    uint256 public memberCount;

    constructor() {
        seed();
    }

    function seed() public {
        uint256 CANDIDATES = 3;

        for (uint16 i = 0; i <= CANDIDATES; i++) {
            string memory strId = Strings.toString(i);

            Candidate storage candidate = candidates[i + 1];
            candidate.id = i + 1;
            candidate.name = string(
                bytes.concat(bytes("Random Candidate"), " ", bytes(strId))
            );
            candidate.votes = 0;

            memberCount++;
        }
    }

    function getCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory id = new Candidate[](memberCount);
        for (uint256 i = 0; i < memberCount; i++) {
            Candidate storage member = candidates[i];
            id[i] = member;
        }
        return id;
    }

    function vote(uint16 id) public returns (Candidate memory) {
        Candidate storage candidate = candidates[id];

        if (candidate.id > 0) {
            candidate.votes++;
        }

        return candidate;
    }
}
