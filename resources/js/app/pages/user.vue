<template>
    <div class="crud">
        <div class="crud-header">
            <input type="text" name="keyword" v-model="searchData" class="search" placeholder="Search Here" required autocomplete="off" />
            <button type="button" class="btn-theme" @click="openManageModal(null)"> New </button>
        </div>
        <div class="crud-body">
            <template v-if="tableData.length === 0 && !listLoading">
                <div class="no-data-founded">
                    <div class="title">No Data Founded</div>
                    <div class="sub-title">Click "New" to add new data</div>
                </div>
            </template>
            <template v-if="tableData.length > 0 && !listLoading">
                <div class="have-data">
                    <div class="crud-content" v-for="each in filteredData" :key="each.id">
                        <div class="title">
                            <div class="text-truncate-2">{{ each.title }}</div>
                        </div>
                        <div class="body">
                            <div class="text-truncate-3">{{ each.body }}</div>
                        </div>
                        <div class="button-group">
                            <button type="button" class="btn btn-edit" @click="openManageModal(each.id)">Edit</button>
                            <button type="button" class="btn btn-delete" @click="openDeleteModal(each.id)">Delete</button>
                        </div>
                    </div>
                </div>
            </template>
            <template v-if="listLoading">
                <div class="data-loading"><div class="spinner"></div></div>
            </template>
        </div>
        <div class="crud-footer" v-if="filteredData.length > 0">
            <button type="button" class="next" @click="prevPage" :disabled="currentPage === 1">Previous</button>
            <div class="count-number">Page {{ currentPage }} out of {{ totalPages }}</div>
            <button type="button" class="previous" @click="nextPage" :disabled="currentPage === totalPages">Next</button>
        </div>
        <div class="modal" id="manageModal" style="display: none">
            <form @submit.prevent="manageApi()" class="modal-content">
                <div class="modal-header">
                    <div class="modal-header-title">
                        <span v-if="!formData.id">Create</span>
                        <span v-if="formData.id">Edit</span> Post
                    </div>
                    <button type="button" class="modal-close" @click="closeManageModal()"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="title" class="form-label">Title</label>
                        <input id="title" type="text" name="title" class="form-control" v-model="formData.title" placeholder="Enter Your Title" required autocomplete="off" />
                    </div>
                    <div class="mb-3">
                        <label for="body" class="form-label">Body</label>
                        <textarea id="body" name="body" class="form-textarea" v-model="formData.body" placeholder="Enter Your Body Text" cols="30" rows="5" required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-cancel" @click="closeManageModal()">Cancel</button>
                    <button type="submit" class="btn btn-theme">
                        <span v-if="!formData.id">Save</span>
                        <span v-if="formData.id">Update</span>
                    </button>
                </div>
            </form>
        </div>
        <div class="modal" id="deleteModal" style="display: none">
            <form @submit.prevent="deleteApi()" class="modal-content">
                <div class="modal-body delete-modal">
                    <div class="text-center">
                        <img :src="'/assets/svg/delete.svg'" width="120" height="120" alt="delete" />
                    </div>
                    <div class="text-center delete-text">Are you Sure?</div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-cancel" @click="closeDeleteModal()">Cancel</button>
                    <button type="submit" class="btn btn-delete">Confirm</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            manageLoading: false,
            listLoading: false,
            formData: { title: "", body: "" },
            tableData: [],
            deleteData: { id: "" },
            searchData: "",
            currentPage: 1,
            limit: 8,
        };
    },
    mounted() {
        this.ReadApi();
    },
    computed: {
        filteredData() {
            const query = this.searchData.toLowerCase();
            const filtered = this.tableData.filter(post =>
                post.title.toLowerCase().includes(query) || post.body.toLowerCase().includes(query)
            );
            const start = (this.currentPage - 1) * this.limit;
            return filtered.slice(start, start + this.limit);
        },
        totalPages() {
            const query = this.searchData.toLowerCase();
            return Math.ceil(
                this.tableData.filter(post =>
                    post.title.toLowerCase().includes(query) || post.body.toLowerCase().includes(query)
                ).length / this.limit
            );
        },
    },
    methods: {
        ajaxRequest(method, url, data, callback) {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            xhr.onreadystatechange = () => {
                console.log(xhr)
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        callback(JSON.parse(xhr.responseText));
                    } else {
                        console.error("Error:", xhr.responseText);
                    }
                }
            };
            xhr.send(JSON.stringify(data));
        },
        manageApi() {
            this.manageLoading = true;
            const url = this.formData.id
                ? `https://jsonplaceholder.typicode.com/posts/${this.formData.id}`
                : `https://jsonplaceholder.typicode.com/posts`;
            const method = this.formData.id ? "PUT" : "POST";

            this.ajaxRequest(method, url, this.formData, response => {
                if (this.formData.id) {
                    const index = this.tableData.findIndex(post => post.id === this.formData.id);
                    if (index !== -1) this.tableData.splice(index, 1, response);
                } else {
                    this.tableData.unshift(response);
                }
                this.closeManageModal();
                this.manageLoading = false;
            });
        },
        deleteApi() {
            const url = `https://jsonplaceholder.typicode.com/posts/${this.deleteData.id}`;
            this.ajaxRequest("DELETE", url, null, () => {
                this.tableData = this.tableData.filter(post => post.id !== this.deleteData.id);
                this.closeDeleteModal();
            });
        },
        ReadApi() {
            this.listLoading = true;
            const url = "https://jsonplaceholder.typicode.com/posts";
            this.ajaxRequest("GET", url, null, response => {
                this.tableData = response || [];
                this.listLoading = false;
            });
        },
        openManageModal(id = null) {
            this.formData = id
                ? { ...this.tableData.find(post => post.id === id) }
                : { title: "", body: "" };
            document.querySelector("#manageModal").style.display = "flex";
        },
        closeManageModal() {
            document.querySelector("#manageModal").style.display = "none";
        },
        openDeleteModal(id) {
            this.deleteData.id = id;
            document.querySelector("#deleteModal").style.display = "flex";
        },
        closeDeleteModal() {
            document.querySelector("#deleteModal").style.display = "none";
        },
        nextPage() {
            if (this.currentPage < this.totalPages) this.currentPage++;
        },
        prevPage() {
            if (this.currentPage > 1) this.currentPage--;
        },
    },
};
</script>
