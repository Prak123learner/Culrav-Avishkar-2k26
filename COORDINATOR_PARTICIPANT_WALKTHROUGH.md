# Registration forms: coordinator and participant walkthrough

**Example event: Avishkar → CyberQuest → Softathlon**

The coordinator first collects a project repository. After participants register, she adds a demo-video question and gives existing participants extra time to answer it.


| Role | Account | CA ID |
| --- | --- | --- |
| Coordinator | Ananya Verma · ananya.verma@example.com | CA-2026-482731 |
| Participant | Aarav Sharma · aarav.sharma@example.com · College reg. no. 20234068 | CA-2026-715284 |

## 1. Coordinator creates the first question

Sign in at `/coordinator/login`. In **Events**, open **Avishkar → CyberQuest → Softathlon**, or search for **Softathlon**. Click **Edit registration form**.

Click **Add question** and enter:

| Setting | Example |
| --- | --- |
| Label | GitHub repository link |
| Type | File / folder URL |
| Instructions | Share your project repository. Make sure coordinators can open the link and read the README. |
| Required | Checked |

Name, email, CA ID and saved profile details are attached automatically; do not add questions asking for them again.

![Coordinator creates a required repository-link question](docs/registration-walkthrough/images/01-create-question-desktop.jpg)

## 2. Set the closing time and publish

Set **Registration closes** to **Required Deadline**. Tick **Publish registration form**, then click **Save subevent & form**. Keep **Allow answer edits while registration is open** checked if participants should be able to correct their initial answers before closing.

This date stops **new registrations**. It is optional: leaving it blank keeps registration open while the event and form remain published. The date/time fields use the coordinator's local time; this example uses IST.

![Closing time, publication checkbox and save button](docs/registration-walkthrough/images/02-deadline-publish-desktop.jpg)

After saving, the event card says **Registration form published**, and its edit button becomes **Update registration form**.

![Softathlon registration form is published](docs/registration-walkthrough/images/03-published-event-desktop.jpg)

## 3. Participant opens and fills the form

Aarav signs in with Google, completes and confirms his profile, opens the public Softathlon event and clicks **Register Now**. The registration page shows the closing time.

![Participant opens Softathlon registration](docs/registration-walkthrough/images/04-prefilled-profile-desktop.jpg)

His saved participant details are included automatically. For this example, he chooses **Register individually** and enters:

`https://github.com/aarav-sharma/campus-connect`

Then he clicks **Submit registration**. Softathlon supports solo or team entries; a team leader would instead select a confirmed team they lead.

![Participant enters a repository URL and submits](docs/registration-walkthrough/images/05-first-response-desktop.jpg)

## 4. Registration is recorded

The page displays **Registration received** with a registration ID. **View your registration** opens the entry in **Registered events**. No coordinator approval is required.

![Registration receipt and link to the participant dashboard](docs/registration-walkthrough/images/06-registration-received-desktop.jpg)

## 5. Coordinator adds a demo-video question later

Ananya opens Softathlon → **Update registration form**, leaves the repository question unchanged, and clicks **Add question**.

| Setting | Example |
| --- | --- |
| Label | Demo video link |
| Type | File / folder URL |
| Instructions | Share a 2-minute project demo. Make sure the video URL is accessible to coordinators; for Drive, use Anyone with the link can view. |
| Required | Checked |

![Coordinator adds the required demo-video question](docs/registration-walkthrough/images/07-add-demo-question-desktop.jpg)

Because responses already exist, the editor displays **Existing participants need to review this form**. She sets **Deadline for existing participants to submit updated answers** to **27 October 2026, 8:00 PM**, then clicks **Update published form**.

![Separate deadline for existing participants and update button](docs/registration-walkthrough/images/08-update-deadline-desktop.jpg)

| Deadline | Who it affects |
| --- | --- |
| 25 October, 8:00 PM | New participants/teams must register before this time. |
| 27 October, 8:00 PM | Already registered participants can submit the requested updated answers until this time. This does not reopen new registrations. |

## 6. Participant sees the update notice

Aarav opens **My portal → Registered events**, or refreshes that tab if it was already open. His existing Softathlon entry now says:

> Softathlon form has been updated. Please review and submit your updated answers.

The notice includes the **27 October, 8:00 PM** deadline and a **Review updated form** button. His earlier registration remains recorded.

![Participant sees the form-update notice and review deadline](docs/registration-walkthrough/images/09-participant-notice-desktop.jpg)

## 7. Participant answers the new question

Click **Review updated form**. The unchanged repository answer is already filled in. The new **Demo video link** field needs an answer.

Aarav enters the example video URL, checks its sharing permissions, and clicks **Submit updated form**.

![Existing repository answer is retained and participant supplies a video URL](docs/registration-walkthrough/images/10-submit-updated-answers-desktop.jpg)

## 8. Both sides see the completed response

The review notice disappears. **Registered events** now shows both submitted links under the same registration ID.

![Participant sees both answers after submitting the update](docs/registration-walkthrough/images/11-updated-response-saved-desktop.jpg)

Ananya opens Softathlon → **Responses** and sees Aarav's profile and both links in one registration. **Earlier form responses** preserves the prior submission. She can use **Download Excel** or **Download CSV** to export responses.

![Coordinator sees the updated registration and earlier-response history](docs/registration-walkthrough/images/12-coordinator-responses-desktop.jpg)

### Remember

- Add a new question when requesting an additional item. Unchanged question answers carry forward; changed questions may require fresh answers.
- For team registrations, the leader submits and updates answers. Members must accept invitations before registration; registering locks the team roster.
- Participants should revisit or refresh Registered events for notices; this walkthrough does not rely on an email notification.
- A URL being accepted does not prove the file is accessible. Participants must check sharing permissions before submitting.
- Someone missing the updated-answer deadline keeps their earlier submission on record; coordinators apply the event's announced eligibility/elimination rules.

## 9. Create a team for team events

Open **My portal → Teams**. Enter a team name and click **Create team**. The person who creates the team becomes its **leader**. Invite members using their CA IDs; each member opens their own Teams tab, refreshes if needed, and accepts the invitation.

In this example, **Code Catalysts** has **Aarav Sharma** as leader and **Isha Gupta** as a confirmed member.

**For a team event, only the team leader needs to fill and submit the registration form.** Once all invitations are accepted and the team meets the event's size requirements, the leader opens the event's **Register Now** form, selects the team, and submits once for everyone. Members do not fill separate forms for the same team entry. Later form updates are also answered by the leader.

![Teams page showing team creation, leader, confirmed member and invitation controls](docs/registration-walkthrough/images/13-teams-desktop.jpg)
