import { h, Component, createRef } from 'preact';
import Card from 'preact-fluid/src/Card/Card';
import CardHeader from 'preact-fluid/src/Card/CardHeader';
import CardBody from 'preact-fluid/src/Card/CardBody';
import TextField from 'preact-fluid/src/Form/TextField/TextField';
import Button from 'preact-fluid/src/Button/Button';
import Grid from 'preact-fluid/src/Layout/Grid';
import Cell from 'preact-fluid/src/Layout/Cell';
import Radio from 'preact-fluid/src/Form/Radio/Radio';
import style from './style';
import DragAndDrop from '../../components/dragAndDrop/index';

const baseURL = '//sharvita.xyz';

class Home extends Component {
	ref = createRef();

	state = {
		isFile: true,
		file: null,
		fileName: null,
		fileUrl: null,
		uploadedTasks: []
	};

	componentDidMount() {
		this.refreshList();
	}

	handleUrlInput(e) {
		const input = e.target.value;

		this.setState({
			fileUrl: input
		});
	}

	handleRadioToggle(e, data) {
		this.setState({
			isFile: (data === 'isFile')
		});
	}

	handleToggleInput() {
		this.ref.current.click();
	}

	handleFiles(e) {
		const file = e[0];

		this.setState({
			file: file,
			fileName: file.name
		});
	}

	submitFile() {
		if (this.state.isFile) {
			const formData = new FormData()
			formData.append('file', this.state.file);

			fetch(baseURL + '/tasks/create/file', {
				method: 'POST', body: formData,
			})
				.then(res => res.json())
				.then(json => console.log(json))
				.then(this.setState({
					fileName: null,
					file: null,
					fileUrl: null
				}));
		} else {
			const param = {
				url: this.state.fileUrl
			};

			fetch(baseURL + '/tasks/create/url', {
				method: 'POST', body: JSON.stringify(param),
			})
				.then(res => res.json())
				.then(json => console.log(json))
				.then(this.setState({
					fileName: null,
					file: null,
					fileUrl: null
				}));
		}

		this.refreshList();
	}

	async refreshList() {
		const response = await fetch(baseURL + '/tasks/list', {
			method: 'GET',
		});
		const data = await response.json();
		let tasks = [];

		for (const item of data.tasks) {
			const path = item.target.split('/');
			const fileName = path[path.length - 1];

			try {
				const report = await fetch(baseURL + '/tasks/report/' + item.id);
				const reportData = await report.json();
				const score = reportData.info.score;

				const reportBlob = await fetch(baseURL + '/tasks/report/' + item.id);
				const blobFile = await reportBlob.blob();
				const downloadReportUrl = window.URL.createObjectURL(blobFile);

				tasks.push({
					fileName: fileName,
					addedOn: item.added_on,
					category: item.category,
					status: item.status,
					score: score,
					url: downloadReportUrl
				});
			} catch (e) {
				const score = 'Pending';
				const downloadReportUrl = null;

				tasks.push({
					fileName: fileName,
					addedOn: item.added_on,
					category: item.category,
					status: item.status,
					score: score,
					url: downloadReportUrl
				});
			}
		}

		this.setState({
			uploadedTasks: tasks
		});
	}

	render() {
		const { isFile } = this.state;

		return (
			<div class={style.home}>
				<Card style="width: 400px; margin: 0 auto;">
					<CardHeader
						title="Welcome to UCheck Sandbox"
						subtitle="This application helps to verify the authentication of file or URL upload. You may drag or drop the file or upload manually."
					/>
					<CardBody>
						<Grid columns={2} gap="10px">
							<Cell center middle height={2}>
								<Radio
									checked={this.state.isFile}
									value="file"
									label="File upload"
									onChange={e => this.handleRadioToggle(e, 'isFile')}
								/>
							</Cell>
							<Cell center middle height={2}>
								<Radio
									checked={!this.state.isFile}
									value="url"
									label="URL upload"
									onChange={e => this.handleRadioToggle(e, 'isUrl')}
								/>
							</Cell>
							{
								isFile ?
									<Cell center middle height={2} width={2}>
										<DragAndDrop
											handleDrop={this.handleFiles.bind(this)}
											onClickRef={this.handleToggleInput.bind(this)}>
											<div class={style.drop_zone} onDropCapture={e => e.preventDefault()}
												onDrop={e => e.preventDefault()}
												onDrag={e => e.preventDefault()}
												onDragOver={e => e.preventDefault()}
												onDragEnter={e => e.preventDefault()}>
												<p>{this.state.fileName ?? 'Drop zone (Click to manually upload)'}</p>
											</div>
										</DragAndDrop>

										<input type="file" onChange={e => this.handleFiles(e.target.files)}
											ref={this.ref} hidden />
									</Cell> :
									<Cell center middle height={2} width={2}>
										<TextField
											hideLabel
											cell={{
												middle: true,
												width: 12
											}}
											label="Input file URL"
											placeholder="https://www.example.com/my/file/text.txt"
											effect="border"
											style="min-width: 350px;"
											value={this.state.fileUrl}
											onChange={this.handleUrlInput.bind(this)}
										/>
									</Cell>
							}
							<Cell center middle height={2} width={2}>
								<Button primary
									onClick={this.submitFile.bind(this)}>
									Analyze
									</Button>
							</Cell>
						</Grid>
					</CardBody>
				</Card>
				<br />
				<Card style="width: 400px; margin: 0 auto;">
					<CardHeader
						title="Uploaded task list"
						subtitle="This is the list of tasks pending to be analyzed."
					/>
					<CardBody>
						{this.state.uploadedTasks.map((item) => {
							return (
								<article>
									<Cell width={1}>
										<Card>
											<CardHeader
												title={item.fileName}
												subtitle={'Created on: ' + item.addedOn}
											/>
											<CardBody>
												<ul style={{ textAlign: 'left', listStyle: 'none' }}>
													<li>Category: {item.category}</li>
													<li>Status: {item.status}</li>
													<li>Score: {item.score === 'Pending' ? 'Pending' : `${item.score}/10`}</li>
												</ul>
												<a href={item.url} download={`${item.fileName}-report.json`}>Download Full Report</a>
											</CardBody>
										</Card>
									</Cell>
									<br />
								</article>
							)
						})}
					</CardBody>
				</Card>
			</div>
		);
	}
}

export default Home;
