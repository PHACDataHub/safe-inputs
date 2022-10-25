/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useEffect } from 'react'

import { Box, Button, Input, FormControl, FormLabel, InputGroup, FormErrorMessage, Icon, Spinner, Table, Tr, Th, Td, TableCaption, TableContainer, Switch, Accordion, AccordionButton, AccordionItem, AccordionPanel, InputLeftElement, InputRightElement, } from '@chakra-ui/react'
import { useTranslation } from "react-i18next";
import { FcDataSheet, FcMinus, FcPlus } from 'react-icons/fc'
import { FullProperties } from 'xlsx'

import { ParseWorker } from '../serviceWorker'
import { ParseEvent } from '../worker'

import { GraphQLJSON } from 'graphql-type-json';

import '../App.css'

import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery, useMutation } from '@apollo/client';
import { json } from 'stream/consumers';
import { graphql } from 'graphql';
import { type } from 'os';
// import { useQuery } from '@apollo/client'
// import { SAY_HELLO } from './graphql.js'

const Get_Data = gql`  
    mutation  verifyJsonFormat($testSheet: JSON!){
        verifyJsonFormat(sheetData: $testSheet)
      }
  `

const testSheet = [
    {
      "A": "id",
      "B": "q1",
      "C": "q2",
      "D": "q3",
      "E": "q4",
      "F": "q5",
      "G": "q6"
    },
    {
      "A": 124,
      "B": "r",
      "C": 1,
      "D": 67,
      "E": "a",
      "F": 3,
      "G": "free form answer"
    },
    {
      "A": 125,
      "B": "s",
      "C": 3,
      "D": 98,
      "E": "a",
      "F": 5,
      "G": "more text"
    },
    {
      "A": 126,
      "B": "sdf",
      "C": 2,
      "D": 76,
      "E": "d",
      "F": 23
    },
    {
      "A": 127,
      "B": "d",
      "C": 3,
      "D": 56,
      "E": "e",
      "F": 56,
      "G": "okay last field"
    }
] ;

// const Get_Data = gql`
//     mutation verifyJsonFormat($testSheet: JSON!){
//         verifyJsonFormat
//   } `

// const Mutate_Data = gql`   `

export default function PageSix() {
    const [ mutation , { loading, error, data }] = useMutation(Get_Data)

    useEffect(() => {
        mutation({ variables: {testSheet}}) 
    },[mutation]);

    return (
        <>
            <Box className="App" >
            <br />
                <p className="App-header">PAGE SIX </p>
                <br />
                <br />
                
                {data ? (<> <pre> 
                    {JSON.stringify(data.verifyJsonFormat, null ,2)}                 
                    </pre> 
                    </>) : null}
                <br />

            </Box >
        </>
    )
}




