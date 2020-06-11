import React, { useEffect, useContext, useState } from "react"
import Page from "./Page"
import { useParams, NavLink, Switch, Route } from "react-router-dom"
import Axios from "axios"
import StateContext from "../StateContext"
import ProfilePost from "./ProfilePost"
import { useImmer } from "use-immer"
import ProfileFollowers from "./ProfileFollowers"
import ProfileFollowing from "./ProfileFollowing"

function Profile() {
  const { username } = useParams()
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: { postCount: "", folowerCount: "", followingCount: "" }
    }
  })

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchData() {
      try {
        const response = await Axios.post(`/profile/${username}`, { token: appState.user.token }, { cancelToken: ourRequest.token })
        setState(draft => {
          draft.profileData = response.data
        })
      } catch (e) {
        console.log("there was a problem")
      }
    }
    fetchData()
    return () => {
      ourRequest.cancel()
    }
  }, [username])

  useEffect(() => {
    if (state.startFollowingRequestCount) {
      const ourRequest = Axios.CancelToken.source()

      async function fetchData() {
        try {
          setState(draft => {
            draft.followActionLoading = true
          })
          const response = await Axios.post(`/addFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: ourRequest.token })
          setState(draft => {
            draft.profileData.isFollowing = true
            draft.profileData.counts.followerCount++
            draft.followActionLoading = false
          })
        } catch (e) {
          console.log("there was a problem")
        }
      }
      fetchData()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.startFollowingRequestCount])

  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      const ourRequest = Axios.CancelToken.source()

      async function fetchData() {
        try {
          setState(draft => {
            draft.followActionLoading = true
          })
          const response = await Axios.post(`/removeFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: ourRequest.token })
          setState(draft => {
            draft.profileData.isFollowing = false
            draft.profileData.counts.followerCount--
            draft.followActionLoading = false
          })
        } catch (e) {
          console.log("there was a problem")
        }
      }
      fetchData()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.stopFollowingRequestCount])

  function startFollowing() {
    setState(draft => {
      draft.startFollowingRequestCount++
    })
  }

  function stopFollowing() {
    setState(draft => {
      draft.stopFollowingRequestCount++
    })
  }

  return (
    <Page title="profile screen">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
        {appState.loggedIn && appState.user.username != state.profileData.profileUsername && !state.profileData.isFollowing && state.profileData.profileUsername != "..." && (
          <button onClick={startFollowing} disable={state.followActionLoading} className="btn btn-primary btn-sm ml-2">
            Follow <i className="fas fa-user-plus"></i>
          </button>
        )}
        {appState.loggedIn && appState.user.username != state.profileData.profileUsername && state.profileData.isFollowing && state.profileData.profileUsername != "..." && (
          <button onClick={stopFollowing} disable={state.followActionLoading} className="btn btn-danger btn-sm ml-2">
            Unfollow <i className="fas fa-user-times"></i>
          </button>
        )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink exact to={`/profile/${state.profileData.profileUsername}`} className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/followers`} className="nav-item nav-link">
          Followers:{state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/following`} className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route exact path="/profile/:username">
          <ProfilePost />
        </Route>
        <Route path="/profile/:username/followers">
          <ProfileFollowers />
        </Route>
        <Route path="/profile/:username/following">
          <ProfileFollowing />
        </Route>
      </Switch>
    </Page>
  )
}

export default Profile
